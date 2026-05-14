// backend/index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const http = require('http'); // Thêm http
const { Server } = require('socket.io'); // Thêm socket.io
const crypto = require('crypto');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error("❌ FATAL: JWT_SECRET is not defined in .env");
    process.exit(1);
}
const JWT_EXPIRES_IN = '7d';

mongoose.set('bufferCommands', false);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

// Map để theo dõi socketId -> userId
const userSockets = new Map();

app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error("❌ FATAL: MONGODB_URI is not defined in .env");
    process.exit(1);
}

// ==========================================
// HELPERS
// ==========================================
function getCurrentWeekCode() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getFullYear()}-W${weekNo}`;
}

// ==========================================
// SCHEMAS & MODELS
// ==========================================

// ==========================================
// 1. PROVINCE (Tỉnh thành)
// ==========================================
const provinceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    region: { type: String, default: '' }, // Miền Bắc, Miền Trung, Miền Nam
    landmarkCount: { type: Number, default: 0 },
    vocabCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    order: { type: Number, default: 0 }, // Thứ tự hiển thị
}, { timestamps: true });

const Province = mongoose.model("Province", provinceSchema);

// ==========================================
// 8. CHAT_MESSAGE (Lịch sử Chatbot)
// ==========================================
const chatMessageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String }, // Thêm để phân biệt các phiên chat
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
}, { timestamps: true, collection: 'chatbot_history' });

const ChatMessage = mongoose.model("ChatMessage", chatMessageSchema);

// ==========================================
// 2. LANDMARK (Địa danh)
// ==========================================
const landmarkSchema = new mongoose.Schema({
    name: { type: String, required: true }, // TIẾNG VIỆT
    slug: { type: String, required: true },
    provinceSlug: { type: String, required: true, index: true },
    provinceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Province' },

    description: { type: String, default: '' },      // TIẾNG VIỆT
    history: { type: String, default: '' },          // TIẾNG VIỆT
    address: { type: String, default: '' },          // TIẾNG VIỆT

    images: [{ type: String }],
    category: { type: String, default: 'Di tích lịch sử' },
    openHours: { type: String, default: '' },
    ticketPrice: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },

    views: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

landmarkSchema.index({ provinceSlug: 1, slug: 1 }, { unique: true });
landmarkSchema.index({ name: 'text', description: 'text', history: 'text' });
const Landmark = mongoose.model("Landmark", landmarkSchema);

// ==========================================
// 3. VOCABULARY (Từ vựng)
// ==========================================
const vocabularySchema = new mongoose.Schema({
    landmarkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Landmark', required: true },
    landmarkSlug: { type: String, required: true, index: true },
    provinceSlug: { type: String, required: true, index: true }, // THÊM: để dễ thống kê theo tỉnh

    word: { type: String, required: true },        // TIẾNG VIỆT
    meaning: { type: String, required: true },     // Giải thích TIẾNG VIỆT
    example: { type: String, default: '' },        // Ví dụ TIẾNG VIỆT
    pronunciation: { type: String, default: '' },  // Phiên âm (IPA/Pinyin...)

    partOfSpeech: { type: String, default: 'danh từ' },
    difficulty: { type: Number, enum: [1, 2, 3], default: 1 }, // 1=Dễ, 2=TB, 3=Khó
    category: { type: String, default: 'general' },
    highlightText: { type: String, default: '' },
    sourceLanguage: { type: String, default: 'vi' },

    // THÊM: Câu hỏi tùy chỉnh do Admin soạn
    customQuestions: [{
        level: { type: Number, enum: [1, 2, 3], required: true }, // 1: Dễ, 2: Trung bình, 3: Khó
        question: { type: String, required: true },
        options: [{ type: String, required: true }], // Mảng 4 đáp án
        answer: { type: String, required: true }      // Đáp án đúng (phải khớp với 1 trong 4 options)
    }]
}, { timestamps: true });

vocabularySchema.index({ landmarkId: 1 });
vocabularySchema.index({ landmarkSlug: 1, word: 1 });
const Vocabulary = mongoose.model("Vocabulary", vocabularySchema);

// ==========================================
// 4. TRANSLATION_CACHE (Cache bản dịch)
// ==========================================
const translationCacheSchema = new mongoose.Schema({
    type: { type: String, enum: ['landmark', 'vocabulary'], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'type' },
    language: { type: String, required: true }, // 'en', 'zh', 'ko', 'ja'

    // Lưu trữ dưới dạng Map để linh hoạt các trường tùy theo type
    translatedData: { type: Map, of: String },

    contentHash: { type: String }, // Để kiểm tra nếu nội dung gốc thay đổi
    useCount: { type: Number, default: 0 },
    lastUsedAt: { type: Date, default: Date.now },
}, { timestamps: true });

translationCacheSchema.index({ sourceId: 1, language: 1, type: 1 }, { unique: true });
const TranslationCache = mongoose.model("TranslationCache", translationCacheSchema);

// ==========================================
// 5. USER (Người dùng)
// ==========================================
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    username: { type: String, required: true, unique: true, trim: true, lowercase: true, minlength: 3, maxlength: 20 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },

    uiLanguage: { type: String, default: 'vi' },        // Ngôn ngữ giao diện
    learningLanguage: { type: String, default: 'en' },  // Ngôn ngữ học tập

    xp: { type: Number, default: 0 },
    weeklyXP: { type: Number, default: 0 }, // Thêm: XP hàng tuần để xếp hạng
    badges: {
        gold: { type: Number, default: 0 },
        silver: { type: Number, default: 0 },
        bronze: { type: Number, default: 0 }
    },
    lastResetWeek: { type: String, default: "" }, // Lưu tuần cuối cùng đã reset (VD: "2026-W19")
    streak: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    dailyGoal: { type: Number, default: 10 },

    isOnline: { type: Boolean, default: false }, // Thêm: trạng thái online
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    lastActivityDate: { type: Date },  // Ngày hoạt động gần nhất (để tính streak)
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateToken = function (expiresIn = '7d') {
    return jwt.sign(
        { id: this._id, role: this.role },
        JWT_SECRET,
        { expiresIn }
    );
};

const User = mongoose.model('User', userSchema);

// ==========================================
// 6. FRIENDSHIP (Quan hệ bạn bè)
// ==========================================
const friendshipSchema = new mongoose.Schema({
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'blocked'], default: 'accepted' } // Ở đây mình mặc định là follow (accepted) luôn cho đơn giản như Duolingo
}, { timestamps: true });

friendshipSchema.index({ requester: 1, recipient: 1 }, { unique: true });
const Friendship = mongoose.model("Friendship", friendshipSchema);

// ==========================================
// HELPER: Cập nhật Streak
// ==========================================
async function updateStreak(userId) {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (user.lastActivityDate) {
        const lastDate = new Date(user.lastActivityDate);
        const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
        const diffTime = today.getTime() - lastDay.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return; // Đã học hôm nay rồi
        } else if (diffDays === 1) {
            user.streak += 1; // Học liên tiếp
        } else {
            user.streak = 1; // Bỏ lỡ nhiều ngày, bắt đầu lại từ 1
        }
    } else {
        user.streak = 1; // Lần đầu học
    }

    user.lastActivityDate = now;
    await user.save();
    console.log(`🔥 Streak updated for ${user.username}: ${user.streak} ngày`);
}

// ==========================================
// HELPER: Kiểm tra và Reset Streak nếu quá hạn
// ==========================================
async function checkStreak(user) {
    if (!user.lastActivityDate) return;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(user.lastActivityDate);
    const lastDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

    const diffTime = today.getTime() - lastDay.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Nếu quá 1 ngày không học (diffDays > 1), reset streak về 0
    if (diffDays > 1) {
        user.streak = 0;
        await user.save();
        console.log(`❄️ Streak reset for ${user.username} (missed ${diffDays - 1} days)`);
    }
}

// ==========================================
// HELPER: Reset XP tuần và trao danh hiệu
// ==========================================
async function checkAndResetWeeklyXP(user) {
    const currentWeek = getCurrentWeekCode();
    if (user.lastResetWeek === currentWeek) return;

    try {
        // 1. Tính toán thứ hạng trong nhóm bạn bè trước khi reset
        const following = await Friendship.find({ requester: user._id }).select('recipient').lean();
        const friendIds = following.map(f => f.recipient);
        friendIds.push(user._id);

        const friendsList = await User.find({ _id: { $in: friendIds } })
            .sort({ weeklyXP: -1 })
            .select('_id weeklyXP')
            .lean();

        const myRank = friendsList.findIndex(u => u._id.toString() === user._id.toString());

        const update = {
            $set: { weeklyXP: 0, lastResetWeek: currentWeek }
        };

        // 2. Trao danh hiệu nếu nằm trong Top 3 (vàng, bạc, đồng) và có học bài (weeklyXP > 0)
        if (user.weeklyXP > 0 && myRank >= 0 && myRank <= 2) {
            const badgeType = myRank === 0 ? 'badges.gold' : (myRank === 1 ? 'badges.silver' : 'badges.bronze');
            update.$inc = { [badgeType]: 1 };
            console.log(`🏆 Awarded ${badgeType} to ${user.username} (Rank ${myRank + 1})`);
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, update, { new: true });

        // Cập nhật lại object để dùng tiếp trong request
        if (updatedUser) {
            user.weeklyXP = updatedUser.weeklyXP;
            user.lastResetWeek = updatedUser.lastResetWeek;
            user.badges = updatedUser.badges;
        }
    } catch (err) {
        console.error("❌ Error resetting weekly XP:", err);
    }
}

// ==========================================
// 6. USER_VOCAB (Sổ tay cá nhân)
// ==========================================
const userVocabSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vocabId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vocabulary', required: true },
    learnedLanguage: { type: String, required: true, default: 'en' },

    box: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
    nextReviewDate: { type: Date, default: Date.now },
    reviewCount: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    isFavorite: { type: Boolean, default: false },
    userNote: { type: String, default: '' },
}, { timestamps: true });

userVocabSchema.index({ userId: 1, vocabId: 1, learnedLanguage: 1 }, { unique: true });
const UserVocab = mongoose.model("UserVocab", userVocabSchema);

// ==========================================
// 7. LEARNING_HISTORY (Lịch sử học tập)
// ==========================================
const learningHistorySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    newWordsLearned: { type: Number, default: 0 },
    wordsReviewed: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    xpGained: { type: Number, default: 0 },
}, { timestamps: true });

learningHistorySchema.index({ userId: 1, date: 1 }, { unique: true });
const LearningHistory = mongoose.model('LearningHistory', learningHistorySchema);

// ==========================================
// MIDDLEWARE - JWT Authentication
// ==========================================
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Vui lòng đăng nhập để tiếp tục' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc tài khoản đã bị vô hiệu hóa' });
        }

        // Tự động kiểm tra reset tuần và streak mỗi khi user thao tác
        await checkAndResetWeeklyXP(user);
        await checkStreak(user);

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại' });
    }
};

// ==========================================
// SOCKET.IO LOGIC (Cập nhật trạng thái Online/Offline)
// ==========================================
io.on('connection', async (socket) => {
    const token = socket.handshake.auth.token;
    if (!token) return socket.disconnect();

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id; // Sửa: decoded.id (khớp với generateToken)

        userSockets.set(socket.id, userId);
        await User.findByIdAndUpdate(userId, { isOnline: true });

        // Thông báo cho mọi người là mình online
        io.emit('status_change', { userId, isOnline: true });

        socket.on('disconnect', async () => {
            const uId = userSockets.get(socket.id);
            if (uId) {
                userSockets.delete(socket.id);
                const stillConnected = Array.from(userSockets.values()).includes(uId);
                if (!stillConnected) {
                    await User.findByIdAndUpdate(uId, { isOnline: false });
                    io.emit('status_change', { userId: uId, isOnline: false });
                }
            }
        });
    } catch (err) {
        socket.disconnect();
    }
});

// ==========================================
// CONNECT DATABASE & START SERVER
// ==========================================
const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB");

        // ==========================================
        // API - SOCIAL & LEADERBOARD
        // ==========================================

        // Tìm kiếm người dùng
        app.get('/api/social/search', authMiddleware, async (req, res) => {
            try {
                const { q } = req.query;
                if (!q) return res.json([]);

                const users = await User.find({
                    $or: [
                        { name: { $regex: q, $options: 'i' } },
                        { username: { $regex: q, $options: 'i' } }
                    ],
                    _id: { $ne: req.user._id }
                }).select('name username avatar streak weeklyXP isOnline').limit(10).lean();

                res.json(users);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Theo dõi bạn bè
        app.post('/api/social/follow/:id', authMiddleware, async (req, res) => {
            try {
                const targetId = req.params.id;
                if (targetId === req.user._id.toString()) return res.status(400).json({ message: 'Không thể tự theo dõi chính mình' });

                await Friendship.findOneAndUpdate(
                    { requester: req.user._id, recipient: targetId },
                    { requester: req.user._id, recipient: targetId, status: 'accepted' },
                    { upsert: true }
                );
                res.json({ message: 'Đã theo dõi' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Hủy theo dõi
        app.delete('/api/social/follow/:id', authMiddleware, async (req, res) => {
            try {
                await Friendship.findOneAndDelete({ requester: req.user._id, recipient: req.params.id });
                res.json({ message: 'Đã bỏ theo dõi' });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Danh sách đang theo dõi (Friends)
        app.get('/api/social/friends', authMiddleware, async (req, res) => {
            try {
                const following = await Friendship.find({ requester: req.user._id }).populate('recipient', 'name username avatar streak weeklyXP isOnline').lean();
                res.json(following.map(f => f.recipient).filter(r => r != null));
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });


        // Bảng xếp hạng (Hỗ trợ global hoặc friends)
        app.get('/api/social/leaderboard', authMiddleware, async (req, res) => {
            try {
                const userId = req.user._id;
                const { scope = 'friends' } = req.query; // 'global' hoặc 'friends'
                const currentWeek = getCurrentWeekCode();

                // 1. Kiểm tra Reset tuần
                await checkAndResetWeeklyXP(req.user);

                let query = {};
                if (scope === 'friends') {
                    const following = await Friendship.find({ requester: userId }).select('recipient').lean();
                    const friendIds = following.map(f => f.recipient);
                    friendIds.push(userId);
                    query = { _id: { $in: friendIds } };
                } else {
                    query = { isActive: true };
                }

                const leaderboard = await User.find(query)
                    .sort({ weeklyXP: -1 })
                    .limit(scope === 'global' ? 50 : 100)
                    .select('name username avatar weeklyXP streak isOnline badges')
                    .lean();

                res.json(leaderboard);
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Danh sách người theo dõi mình (Followers)
        app.get('/api/social/followers', authMiddleware, async (req, res) => {
            try {
                const followers = await Friendship.find({ recipient: req.user._id }).populate('requester', 'name username avatar streak weeklyXP isOnline badges').lean();
                res.json(followers.map(f => f.requester).filter(r => r != null));
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Thống kê số lượng follow
        app.get('/api/social/stats', authMiddleware, async (req, res) => {
            try {
                const [followingCount, followersCount] = await Promise.all([
                    Friendship.countDocuments({ requester: req.user._id }),
                    Friendship.countDocuments({ recipient: req.user._id })
                ]);
                res.json({ followingCount, followersCount });
            } catch (error) {
                res.status(500).json({ message: error.message });
            }
        });

        // Root endpoint
        app.get('/', (req, res) => {
            res.send('Hello from LingoVoyage Backend! 🌍');
        });

        server.listen(5000, () => {
            console.log(`🚀 Server running at http://localhost:5000`);
        });


    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
};

startServer();

// ==========================================
// API - PROVINCES (Tỉnh thành)
// ==========================================

// Lấy danh sách tỉnh (hỗ trợ phân trang, tìm kiếm)
app.get('/api/provinces', async (req, res) => {
    try {
        const { page = 1, limit = 0, search = '' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { slug: { $regex: search.toLowerCase(), $options: 'i' } }
                ]
            };
        }

        const total = await Province.countDocuments(query);

        let findQuery = Province.find(query).sort({ name: 1 });

        if (limitNum > 0) {
            findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        }

        const provincesData = await findQuery.lean();

        // Tính toán linh động số lượng địa danh và từ vựng để luôn chính xác 
        // ngay cả khi user thêm dữ liệu trực tiếp từ database
        for (let prov of provincesData) {
            const totalLandmarks = await Landmark.countDocuments({ provinceSlug: prov.slug });
            const totalVocabs = await Vocabulary.countDocuments({ provinceSlug: prov.slug });

            prov.landmarkCount = totalLandmarks;
            prov.vocabCount = totalVocabs;
        }

        console.log(`🔍 Found ${provincesData.length}/${total} provinces (Page: ${pageNum}, Limit: ${limitNum}, Search: "${search}")`);

        res.json({
            provinces: provincesData,
            total,
            totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
            currentPage: pageNum
        });
    } catch (error) {
        console.error("❌ Error fetching provinces:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy chi tiết 1 tỉnh theo slug
app.get('/api/provinces/:slug', async (req, res) => {
    try {
        const province = await Province.findOne({ slug: req.params.slug }).lean();
        if (!province) {
            return res.status(404).json({ message: 'Không tìm thấy tỉnh thành' });
        }

        // Tính toán linh động số lượng địa danh và từ vựng
        const totalLandmarks = await Landmark.countDocuments({ provinceSlug: province.slug });
        const totalVocabs = await Vocabulary.countDocuments({ provinceSlug: province.slug });

        province.landmarkCount = totalLandmarks;
        province.vocabCount = totalVocabs;

        // Tăng lượt xem
        if (req.query.noview !== '1') {
            await Province.updateOne({ _id: province._id }, { $inc: { views: 1 } });
            province.views = (province.views || 0) + 1;
        }

        res.json(province);
    } catch (error) {
        console.error("❌ Error fetching province:", error);
        res.status(500).json({ message: error.message });
    }
});

// Thêm tỉnh mới
app.post('/api/provinces', async (req, res) => {
    try {
        const province = new Province(req.body);
        const newProvince = await province.save();
        console.log(`✅ Created province: ${newProvince.name}`);
        res.status(201).json(newProvince);
    } catch (error) {
        console.error("❌ Error creating province:", error);
        res.status(400).json({ message: error.message });
    }
});

// Cập nhật tỉnh
app.put('/api/provinces/:id', async (req, res) => {
    try {
        const province = await Province.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!province) {
            return res.status(404).json({ message: 'Không tìm thấy tỉnh' });
        }
        res.json(province);
    } catch (error) {
        console.error("❌ Error updating province:", error);
        res.status(400).json({ message: error.message });
    }
});

// Xóa tỉnh
app.delete('/api/provinces/:id', async (req, res) => {
    try {
        const province = await Province.findByIdAndDelete(req.params.id);
        if (!province) {
            return res.status(404).json({ message: 'Không tìm thấy tỉnh' });
        }
        // Xóa luôn các địa danh thuộc tỉnh đó
        await Landmark.deleteMany({ provinceSlug: province.slug });
        console.log(`🗑️ Deleted province: ${province.name} and its landmarks`);
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
        console.error("❌ Error deleting province:", error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - LANDMARKS (Địa danh)
// ==========================================

// Lấy danh sách địa danh theo tỉnh
app.get('/api/provinces/:slug/landmarks', async (req, res) => {
    try {
        const { page = 1, limit = 0, search = '', category = '', sort = 'newest' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);

        let query = { provinceSlug: req.params.slug };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category && category !== 'Tất cả') {
            query.category = category;
        }

        const total = await Landmark.countDocuments(query);

        let sortObj = { createdAt: -1 };
        if (sort === 'oldest') sortObj = { createdAt: 1 };
        if (sort === 'a-z') sortObj = { name: 1 };
        if (sort === 'z-a') sortObj = { name: -1 };
        if (sort === 'popular') sortObj = { views: -1 };

        let findQuery = Landmark.find(query).sort(sortObj);

        if (limitNum > 0) {
            findQuery = findQuery.skip((pageNum - 1) * limitNum).limit(limitNum);
        }

        const landmarks = await findQuery.lean();

        console.log(`🔍 Found ${landmarks.length}/${total} landmarks for province: ${req.params.slug} (Page: ${pageNum}, Limit: ${limitNum})`);

        res.json({
            landmarks,
            total,
            totalPages: limitNum > 0 ? Math.ceil(total / limitNum) : 1,
            currentPage: pageNum
        });
    } catch (error) {
        console.error("❌ Error fetching landmarks:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy chi tiết 1 địa danh
app.get('/api/provinces/:provinceSlug/landmarks/:landmarkSlug', async (req, res) => {
    try {
        const landmark = await Landmark.findOne({
            provinceSlug: req.params.provinceSlug,
            slug: req.params.landmarkSlug
        });
        if (!landmark) {
            return res.status(404).json({ message: 'Không tìm thấy địa danh' });
        }
        // Tăng lượt xem
        if (req.query.noview !== '1') {
            landmark.views += 1;
            await landmark.save();
        }

        // Lấy danh sách từ vựng đi kèm (Dùng cả ID và Slug cho chắc chắn)
        const vocabularies = await Vocabulary.find({
            $or: [
                { landmarkId: landmark._id },
                { landmarkSlug: landmark.slug }
            ]
        }).lean();

        // Chuyển sang plain object để gán thêm thuộc tính
        const landmarkObj = landmark.toObject();
        landmarkObj.vocabularies = vocabularies;

        res.json(landmarkObj);
    } catch (error) {
        console.error("❌ Error fetching landmark:", error);
        res.status(500).json({ message: error.message });
    }
});

// Thêm địa danh mới
app.post('/api/provinces/:slug/landmarks', async (req, res) => {
    try {
        const province = await Province.findOne({ slug: req.params.slug });
        if (!province) {
            return res.status(404).json({ message: 'Không tìm thấy tỉnh' });
        }

        const { vocabularies, ...landmarkData } = req.body;
        const landmark = new Landmark({
            ...landmarkData,
            provinceSlug: req.params.slug,
            provinceId: province._id
        });
        const newLandmark = await landmark.save();

        // Lưu danh sách từ vựng (nếu có)
        if (vocabularies && Array.isArray(vocabularies)) {
            const vocabDocs = vocabularies.map(v => ({
                ...v,
                landmarkId: newLandmark._id,
                landmarkSlug: newLandmark.slug,
                provinceSlug: req.params.slug
            }));
            await Vocabulary.insertMany(vocabDocs);
        }

        // Cập nhật thống kê cho tỉnh (tùy chọn vì đã có hàm tính động ở trên)
        province.landmarkCount += 1;
        province.vocabCount += (vocabularies?.length || 0);
        await province.save();

        console.log(`✅ Created landmark: ${newLandmark.name} in ${province.name}`);
        res.status(201).json(newLandmark);
    } catch (error) {
        console.error("❌ Error creating landmark:", error);
        res.status(400).json({ message: error.message });
    }
});

// Cập nhật địa danh
app.put('/api/landmarks/:id', async (req, res) => {
    try {
        const landmark = await Landmark.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!landmark) {
            return res.status(404).json({ message: 'Không tìm thấy địa danh' });
        }
        res.json(landmark);
    } catch (error) {
        console.error("❌ Error updating landmark:", error);
        res.status(400).json({ message: error.message });
    }
});

// Xóa địa danh
app.delete('/api/landmarks/:id', async (req, res) => {
    try {
        const landmark = await Landmark.findByIdAndDelete(req.params.id);
        if (!landmark) {
            return res.status(404).json({ message: 'Không tìm thấy địa danh' });
        }
        // Xóa các từ vựng liên quan
        await Vocabulary.deleteMany({ landmarkId: landmark._id });

        // Giảm count trong Province
        await Province.findOneAndUpdate(
            { slug: landmark.provinceSlug },
            {
                $inc: {
                    landmarkCount: -1
                }
            }
        );
        console.log(`🗑️ Deleted landmark: ${landmark.name}`);
        res.json({ message: 'Đã xóa thành công' });
    } catch (error) {
        console.error("❌ Error deleting landmark:", error);
        res.status(500).json({ message: error.message });
    }
});

// Lấy tất cả địa danh (cho admin) - kèm vocabCount
app.get('/api/landmarks', async (req, res) => {
    try {
        const landmarks = await Landmark.find().sort({ createdAt: -1 }).lean();
        for (let lm of landmarks) {
            lm.vocabCount = await Vocabulary.countDocuments({ landmarkId: lm._id });
        }
        res.json(landmarks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - VOCABULARY CRUD (Từ vựng)
// ==========================================

// Lấy từ vựng theo landmarkId
app.get('/api/landmarks/:id/vocabularies', async (req, res) => {
    try {
        const vocabs = await Vocabulary.find({ landmarkId: req.params.id }).sort({ createdAt: 1 }).lean();
        res.json(vocabs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Thêm từ vựng cho 1 địa danh
app.post('/api/landmarks/:id/vocabularies', async (req, res) => {
    try {
        const landmark = await Landmark.findById(req.params.id);
        if (!landmark) return res.status(404).json({ message: 'Không tìm thấy địa danh' });

        const vocab = new Vocabulary({
            ...req.body,
            landmarkId: landmark._id,
            landmarkSlug: landmark.slug,
            provinceSlug: landmark.provinceSlug,
        });
        const saved = await vocab.save();
        console.log(`✅ Added vocab "${saved.word}" to ${landmark.name}`);
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Cập nhật từ vựng
app.put('/api/vocabularies/:id', async (req, res) => {
    try {
        const vocab = await Vocabulary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!vocab) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
        res.json(vocab);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Xóa từ vựng
app.delete('/api/vocabularies/:id', async (req, res) => {
    try {
        const vocab = await Vocabulary.findByIdAndDelete(req.params.id);
        if (!vocab) return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
        // Xóa luôn các bản ghi UserVocab liên quan
        await UserVocab.deleteMany({ vocabId: vocab._id });
        console.log(`🗑️ Deleted vocab: ${vocab.word}`);
        res.json({ message: 'Đã xóa từ vựng' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - ADMIN STATS (Thống kê)
// ==========================================
app.get('/api/admin/stats', async (req, res) => {
    try {
        const [provinceCount, landmarkCount, vocabCount, userCount, landmarks, recentUsers, provinces] = await Promise.all([
            Province.countDocuments(),
            Landmark.countDocuments(),
            Vocabulary.countDocuments(),
            User.countDocuments(),
            Landmark.find().sort({ views: -1 }).limit(5).lean(),
            User.find().sort({ createdAt: -1 }).limit(5).select('name username email avatar createdAt xp streak isOnline').lean(),
            Province.find().select('name slug region landmarkCount vocabCount').sort({ landmarkCount: -1 }).limit(5).lean(),
        ]);

        const totalViews = await Landmark.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]);
        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: todayStart } });
        const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: weekStart } });

        // Top provinces by landmarks
        for (let p of provinces) {
            p.vocabCount = await Vocabulary.countDocuments({ provinceSlug: p.slug });
        }

        res.json({
            counts: { provinces: provinceCount, landmarks: landmarkCount, vocabs: vocabCount, users: userCount, views: totalViews[0]?.total || 0 },
            newUsers: { today: newUsersToday, thisWeek: newUsersThisWeek },
            topLandmarks: landmarks.map(l => ({ name: l.name, slug: l.slug, views: l.views || 0, provinceSlug: l.provinceSlug, image: l.images?.[0] })),
            recentUsers,
            topProvinces: provinces,
        });
    } catch (error) {
        console.error('❌ Admin stats error:', error);
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - AUTHENTICATION
// ==========================================

// ĐĂNG KÝ
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, email, password, confirmPassword, nativeLanguage, learningLanguage } = req.body;

        // Validate required fields
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin', field: 'general' });
        }

        // Validate name
        if (name.trim().length < 2) {
            return res.status(400).json({ message: 'Họ tên phải có ít nhất 2 ký tự', field: 'name' });
        }
        if (name.trim().length > 50) {
            return res.status(400).json({ message: 'Họ tên không được quá 50 ký tự', field: 'name' });
        }

        // Validate username
        if (username.length < 3 || username.length > 20) {
            return res.status(400).json({ message: 'Tên đăng nhập phải từ 3-20 ký tự', field: 'username' });
        }
        if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
            return res.status(400).json({ message: 'Tên đăng nhập chỉ chứa chữ thường, số và dấu _', field: 'username' });
        }

        // Validate email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Email không hợp lệ', field: 'email' });
        }

        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự', field: 'password' });
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
            return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số', field: 'password' });
        }

        // Validate confirm password
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp', field: 'confirmPassword' });
        }

        // Check duplicate email
        const existingEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingEmail) {
            return res.status(409).json({ message: 'Email này đã được sử dụng', field: 'email' });
        }

        // Check duplicate username
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
            return res.status(409).json({ message: 'Tên đăng nhập đã tồn tại', field: 'username' });
        }

        // Create user
        const user = new User({
            name: name.trim(),
            username: username.toLowerCase().trim(),
            email: email.toLowerCase().trim(),
            password,
            uiLanguage: req.body.uiLanguage || nativeLanguage || 'vi',
            learningLanguage: req.body.learningLanguage || learningLanguage || 'en',
        });
        await user.save();

        // Generate token
        const token = user.generateToken();

        console.log(`✅ New user registered: ${user.username} (${user.email})`);
        res.status(201).json({
            message: 'Đăng ký thành công!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                xp: user.xp,
                weeklyXP: user.weeklyXP || 0,
                streak: user.streak,
                level: user.level,
                badges: user.badges,
                uiLanguage: user.uiLanguage,
                learningLanguage: user.learningLanguage,
            },
        });
    } catch (error) {
        console.error('❌ Register error detail:', error);

        // Write error to file for reliable debugging
        try {
            const fs = require('fs');
            const errorLog = `[${new Date().toISOString()}] REGISTER ERROR:\nName: ${error.name}\nMessage: ${error.message}\nStack: ${error.stack}\n\n`;
            fs.appendFileSync('backend_error.log', errorLog);
        } catch (fsErr) {
            console.error('Failed to write error to log file:', fsErr);
        }

        // Handle mongoose duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                message: `${field === 'email' ? 'Email' : 'Tên đăng nhập'} đã tồn tại`,
                field
            });
        }

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0];
            return res.status(400).json({ message: firstError.message, field: firstError.path });
        }

        res.status(500).json({
            message: 'Lỗi server: ' + error.message,
            stack: error.stack
        });
    }
});

// ĐĂNG NHẬP
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, rememberMe } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        // Tìm user theo email (include password field)
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng', field: 'email' });
        }

        // Check if account is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.' });
        }

        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng', field: 'password' });
        }

        // Update last login
        user.lastLoginAt = new Date();
        await user.save();

        // Tạo token (lưu 30 ngày nếu chọn Ghi nhớ)
        const token = user.generateToken(rememberMe ? '30d' : '7d');

        console.log(`✅ User logged in: ${user.username} (Remember: ${!!rememberMe})`);
        res.json({
            message: 'Đăng nhập thành công!',
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                role: user.role,
                xp: user.xp,
                weeklyXP: user.weeklyXP || 0,
                streak: user.streak,
                level: user.level,
                uiLanguage: user.uiLanguage,
                learningLanguage: user.learningLanguage,
                badges: user.badges,
            },
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// LẤY THÔNG TIN USER HIỆN TẠI
app.get('/api/auth/me', authMiddleware, async (req, res) => {
    try {
        res.json({
            user: {
                _id: req.user._id,
                name: req.user.name,
                username: req.user.username,
                email: req.user.email,
                avatar: req.user.avatar,
                role: req.user.role,
                xp: req.user.xp,
                weeklyXP: req.user.weeklyXP || 0,
                streak: req.user.streak,
                level: req.user.level,
                uiLanguage: req.user.uiLanguage,
                learningLanguage: req.user.learningLanguage,
                badges: req.user.badges,
                createdAt: req.user.createdAt,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// QUÊN MẬT KHẨU - Gửi mã OTP
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Vui lòng nhập email' });
        }

        const user = await User.findOne({ email: email.toLowerCase() }).select('+resetPasswordToken +resetPasswordExpires');
        if (!user) {
            // Không tiết lộ email không tồn tại (bảo mật)
            return res.json({ message: 'Nếu email tồn tại, mã xác nhận đã được gửi.' });
        }

        // Tạo OTP 6 số
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordToken = crypto.createHash('sha256').update(otp).digest('hex');
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 phút
        await user.save();

        // Trong production sẽ gửi email thật, ở đây log ra console
        console.log(`🔑 Password reset OTP for ${user.email}: ${otp}`);

        res.json({
            message: 'Mã xác nhận đã được gửi đến email của bạn.',
            // CHỈ cho DEV - production phải bỏ dòng này:
            _devOtp: otp,
        });
    } catch (error) {
        console.error('❌ Forgot password error:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// ĐẶT LẠI MẬT KHẨU
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword, confirmNewPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự', field: 'newPassword' });
        }
        if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
            return res.status(400).json({ message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 số', field: 'newPassword' });
        }
        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp', field: 'confirmNewPassword' });
        }

        // Hash OTP để so sánh
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: hashedOtp,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+password +resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ message: 'Mã xác nhận không đúng hoặc đã hết hạn', field: 'otp' });
        }

        // Update password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        console.log(`✅ Password reset successful for: ${user.email}`);
        res.json({ message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' });
    } catch (error) {
        console.error('❌ Reset password error:', error);
        res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
    }
});

// CHECK USERNAME AVAILABILITY (for real-time validation)
app.get('/api/auth/check-username/:username', async (req, res) => {
    try {
        const exists = await User.findOne({ username: req.params.username.toLowerCase() });
        res.json({ available: !exists });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==========================================
// API - USERS (Admin)
// ==========================================
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 }).select('-password').lean();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.patch('/api/users/:id/toggle-status', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy user' });
        user.isActive = !user.isActive;
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - USER LEARNING STATS (Thống kê học tập)
// ==========================================

app.get('/api/user/learning-stats', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        // Đếm tổng từ trong sổ tay
        const totalSaved = await UserVocab.countDocuments({ userId });

        // Đếm từ đã thuộc (box >= 3)
        const mastered = await UserVocab.countDocuments({ userId, box: { $gte: 3 } });

        // Đếm từ cần ôn tập (nextReviewDate <= now)
        const needReview = await UserVocab.countDocuments({
            userId,
            nextReviewDate: { $lte: new Date() }
        });

        // Lấy từ vựng gần đây nhất đã lưu (5 từ)
        const recentWords = await UserVocab.find({ userId })
            .populate({ path: 'vocabId', model: 'Vocabulary', select: 'word meaning partOfSpeech difficulty' })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentFiltered = recentWords
            .filter(uv => uv.vocabId != null)
            .map(uv => ({
                _id: uv._id,
                word: uv.vocabId.word,
                meaning: uv.vocabId.meaning,
                partOfSpeech: uv.vocabId.partOfSpeech,
                difficulty: uv.vocabId.difficulty,
                box: uv.box,
                reviewCount: uv.reviewCount,
                correctCount: uv.correctCount
            }));

        // Tính tiến trình hôm nay
        const user = req.user;
        const dailyGoal = user.dailyGoal || 10;
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const todayLearned = await UserVocab.countDocuments({
            userId,
            createdAt: { $gte: todayStart }
        });

        const progress = Math.min(Math.round((todayLearned / dailyGoal) * 100), 100);

        res.json({
            totalSaved,
            mastered,
            needReview,
            todayLearned,
            dailyGoal,
            progress,
            streak: user.streak || 0,
            xp: user.xp || 0,
            level: user.level || 1,
            recentWords: recentFiltered
        });
    } catch (error) {
        console.error("❌ Error fetching learning stats:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==========================================
// API - USER NOTEBOOK (Sổ tay từ vựng)
// ==========================================

// Lấy toàn bộ sổ tay của user (populated đầy đủ)
app.get('/api/user/notebook', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const userVocabs = await UserVocab.find({ userId })
            .populate({
                path: 'vocabId',
                model: 'Vocabulary'
            })
            .sort({ createdAt: -1 })
            .lean();

        // Lọc ra những bản ghi mà vocabId đã bị xóa
        const validVocabs = userVocabs.filter(uv => uv.vocabId != null);

        // Enrich thêm tên địa danh từ Landmark
        const enriched = await Promise.all(validVocabs.map(async (uv) => {
            const landmark = await Landmark.findById(uv.vocabId.landmarkId).select('name slug provinceSlug').lean();
            const province = landmark ? await Province.findOne({ slug: landmark.provinceSlug }).select('name').lean() : null;

            return {
                _id: uv._id,
                vocabId: uv.vocabId._id,
                word: uv.vocabId.word,
                meaning: uv.vocabId.meaning,
                example: uv.vocabId.example,
                partOfSpeech: uv.vocabId.partOfSpeech,
                difficulty: uv.vocabId.difficulty,
                landmarkName: landmark ? landmark.name : 'Không rõ',
                landmarkSlug: landmark ? landmark.slug : '',
                provinceSlug: uv.vocabId.provinceSlug || '',
                provinceName: province ? province.name : '',
                box: uv.box,
                reviewCount: uv.reviewCount,
                correctCount: uv.correctCount,
                isFavorite: uv.isFavorite,
                userNote: uv.userNote,
                learnedLanguage: uv.learnedLanguage,
                nextReviewDate: uv.nextReviewDate,
                savedAt: uv.createdAt
            };
        }));

        res.json({ vocabs: enriched, total: enriched.length });
    } catch (error) {
        console.error("❌ Error fetching notebook:", error);
        res.status(500).json({ message: 'Lỗi server khi tải sổ tay' });
    }
});

// Thêm từ vựng vào sổ tay
app.post('/api/user/notebook', authMiddleware, async (req, res) => {
    try {
        const { vocabId } = req.body;
        const userId = req.user._id;

        const vocab = await Vocabulary.findById(vocabId);
        if (!vocab) {
            return res.status(404).json({ message: 'Không tìm thấy từ vựng' });
        }

        const existing = await UserVocab.findOne({ userId, vocabId });
        if (existing) {
            return res.status(400).json({ message: 'Từ vựng này đã có trong sổ tay của bạn' });
        }

        const userVocab = new UserVocab({
            userId,
            vocabId,
            learnedLanguage: req.user.learningLanguage || 'en',
            nextReviewDate: new Date()
        });

        await userVocab.save();
        await User.findByIdAndUpdate(userId, { $inc: { xp: 5 } });

        // Cập nhật streak
        await updateStreak(userId);

        // Ghi nhận từ mới và XP vào lịch sử học tập
        await updateLearningHistory(userId, { newWordsLearned: 1, xpGained: 5 });

        res.status(201).json({ message: 'Đã thêm vào sổ tay thành công (+5 XP)' });
    } catch (error) {
        console.error("❌ Error adding to notebook:", error);
        res.status(500).json({ message: 'Lỗi server khi lưu từ vựng' });
    }
});

// Xóa từ vựng khỏi sổ tay
app.delete('/api/user/notebook/:id', authMiddleware, async (req, res) => {
    try {
        const deleted = await UserVocab.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!deleted) {
            return res.status(404).json({ message: 'Không tìm thấy từ vựng trong sổ tay' });
        }

        res.json({ message: 'Đã xóa khỏi sổ tay' });
    } catch (error) {
        console.error("❌ Error deleting from notebook:", error);
        res.status(500).json({ message: 'Lỗi server khi xóa từ vựng' });
    }
});

// Toggle yêu thích
app.patch('/api/user/notebook/:id/favorite', authMiddleware, async (req, res) => {
    try {
        const uv = await UserVocab.findOne({ _id: req.params.id, userId: req.user._id });
        if (!uv) return res.status(404).json({ message: 'Không tìm thấy' });

        uv.isFavorite = !uv.isFavorite;
        await uv.save();

        res.json({ isFavorite: uv.isFavorite });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật ghi chú cá nhân
app.patch('/api/user/notebook/:id/note', authMiddleware, async (req, res) => {
    try {
        const uv = await UserVocab.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { $set: { userNote: req.body.note || '' } },
            { new: true }
        );
        if (!uv) return res.status(404).json({ message: 'Không tìm thấy' });

        res.json({ userNote: uv.userNote });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - QUIZ GAME (Trắc nghiệm thông minh)
// ==========================================

// Lấy thông tin chuẩn bị chơi Quiz (kiểm tra số lượng từ)
app.get('/api/user/quiz/setup', authMiddleware, async (req, res) => {
    try {
        const count = await UserVocab.countDocuments({ userId: req.user._id });
        res.json({ totalInNotebook: count });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// ==========================================
// API - CHATBOT (AI Assistant)
// ==========================================

// Cấu hình Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/api/chatbot/chat', authMiddleware, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;
        const currentSessionId = sessionId || "default_session"; // Nếu frontend không truyền thì dùng default

        if (!GEMINI_API_KEY || GEMINI_API_KEY === "CHUA_CO_KEY") {
            return res.status(200).json({
                text: "Chào bạn! Tôi là LingoBot. Hiện tại chủ nhân của tôi chưa cấu hình API Key cho tôi nên tôi chưa thể suy nghĩ được. Hãy hướng dẫn chủ nhân lấy API Key từ Google AI Studio nhé!"
            });
        }

        // 1. Lưu tin nhắn người dùng kèm sessionId
        await ChatMessage.create({ userId, sessionId: currentSessionId, role: 'user', content: message });

        // 2. Lấy lịch sử chat gần đây (10 tin nhắn) CÙNG SESSION để AI có context
        const history = await ChatMessage.find({ userId, sessionId: currentSessionId }).sort({ createdAt: -1 }).skip(1).limit(10).lean();

        const rawHistory = history.reverse();
        const chatHistory = [];
        for (const msg of rawHistory) {
            const role = msg.role === 'user' ? 'user' : 'model';
            const content = msg.content || " ";
            if (chatHistory.length === 0) {
                chatHistory.push({ role, parts: [{ text: content }] });
            } else {
                const lastMsg = chatHistory[chatHistory.length - 1];
                if (lastMsg.role === role) {
                    lastMsg.parts[0].text += "\n" + content;
                } else {
                    chatHistory.push({ role, parts: [{ text: content }] });
                }
            }
        }

        // Gemini BẮT BUỘC lịch sử phải bắt đầu bằng tin nhắn của 'user'
        if (chatHistory.length > 0 && chatHistory[0].role !== 'user') {
            chatHistory.shift(); // Xóa tin nhắn model đầu tiên nếu bị lẻ
        }

        // 3. Tìm kiếm context từ Database (nếu người dùng hỏi về địa danh)
        let extraContext = "";
        let foundLandmarks = [];
        try {
            const safeQuery = message.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const searchRegex = new RegExp(safeQuery, 'i');

            foundLandmarks = await Landmark.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex }
                ]
            }).limit(3).select('name description images slug provinceSlug').lean();

            if (foundLandmarks.length === 0 && message.length > 5) {
                const words = message.split(' ').filter(w => w.length > 3);
                if (words.length > 0) {
                    const regexes = words.map(w => new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
                    foundLandmarks = await Landmark.find({
                        $or: regexes.map(r => ({ name: r }))
                    }).limit(3).select('name description images slug provinceSlug').lean();
                }
            }

            if (foundLandmarks.length > 0) {
                extraContext = "\nThông tin từ CSDL (Hãy dùng để gợi ý nếu liên quan):\n" + foundLandmarks.map(l => `- Tên: ${l.name}, Slug: ${l.slug}, Mô tả: ${l.description.substring(0, 250)}...`).join('\n');
            }
        } catch (dbErr) {
            console.log("DB Context Search skipped or failed:", dbErr.message);
        }

        // 4. Gọi Gemini AI
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json",
            },
            systemInstruction: `Bạn là LingoBot, trợ lý du lịch chuyên nghiệp của ứng dụng LingoVoyage.
Nhiệm vụ và quy tắc CỦA BẠN:
1. Trả lời NGẮN GỌN, mượt mà và đúng trọng tâm.
2. NẾU NGƯỜI DÙNG HỎI LẠC ĐỀ (chính trị, lập trình, spam... không liên quan du lịch/văn hóa/ngôn ngữ): Hãy từ chối một cách lịch sự.
3. NẾU NGƯỜI DÙNG HỎI SAI hoặc không rõ ràng: Yêu cầu làm rõ.
4. NẾU CÓ DỮ LIỆU TỪ "Thông tin từ CSDL": Ưu tiên dùng dữ liệu này để trả lời.
5. LUÔN LUÔN trả về ĐÚNG MỘT OBJECT JSON duy nhất:
{
  "reply": "Câu trả lời của bạn",
  "suggestedSlug": "slug của địa danh" (Điền slug nếu bạn đang giới thiệu về một địa danh CỤ THỂ có trong "Thông tin từ CSDL". Nếu không, để null)
}
${extraContext}`
        });

        const chat = model.startChat({ history: chatHistory });
        let botResponse = "";
        try {
            const result = await chat.sendMessage(message);
            botResponse = result.response.text();
        } catch (apiError) {
            console.error("Gemini API Error:", apiError.message);
            let fallbackMsg = "Xin lỗi, hệ thống AI đang gặp chút trục trặc. Bạn thử lại sau nhé!";
            if (apiError.status === 503 || (apiError.message && apiError.message.includes('503'))) {
                fallbackMsg = "LingoBot hiện đang quá tải do có quá nhiều du khách. Bạn đợi vài giây rồi nhắn lại cho mình nhé! 🌟";
            } else if (apiError.status === 429 || (apiError.message && apiError.message.includes('429'))) {
                fallbackMsg = "Mình đang nhận được quá nhiều tin nhắn cùng lúc. Bạn chờ mình xíu nha! ⏳";
            }
            botResponse = JSON.stringify({ reply: fallbackMsg, suggestedSlug: null });
        }

        let replyText = botResponse;
        let suggestedLandmark = null;

        try {
            const parsed = JSON.parse(botResponse);
            replyText = parsed.reply || botResponse;
            if (parsed.suggestedSlug) {
                const lm = foundLandmarks.find(l => l.slug === parsed.suggestedSlug) || await Landmark.findOne({ slug: parsed.suggestedSlug }).select('name images slug provinceSlug').lean();
                if (lm) {
                    suggestedLandmark = {
                        name: lm.name,
                        slug: lm.slug,
                        provinceSlug: lm.provinceSlug,
                        image: lm.images && lm.images.length > 0 ? lm.images[0] : null
                    };
                }
            }
        } catch (e) {
            console.error("JSON parse error:", e);
        }

        // 5. Lưu tin nhắn của Bot kèm sessionId
        await ChatMessage.create({ userId, sessionId: currentSessionId, role: 'assistant', content: replyText });

        res.json({ text: replyText, landmark: suggestedLandmark });
    } catch (error) {
        console.error("❌ Chatbot Error Details:", error);
        res.status(500).json({
            message: "LingoBot đang gặp chút trục trặc!",
            error: error.message
        });
    }
});

// Lấy lịch sử chat cho UI
app.get('/api/chatbot/history', authMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.query;
        let query = { userId: req.user._id };
        if (sessionId) {
            query.sessionId = sessionId; // Chỉ lấy tin nhắn của phiên hiện tại
        }

        const history = await ChatMessage.find(query).sort({ createdAt: 1 }).limit(50).lean();
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// HELPER: Cập nhật Lịch sử học tập hằng ngày
async function updateLearningHistory(userId, data) {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Đưa về đầu ngày

        const updateQuery = { $inc: {} };
        if (data.newWordsLearned) updateQuery.$inc.newWordsLearned = data.newWordsLearned;
        if (data.wordsReviewed) updateQuery.$inc.wordsReviewed = data.wordsReviewed;
        if (data.correctAnswers) updateQuery.$inc.correctAnswers = data.correctAnswers;
        if (data.xpGained) updateQuery.$inc.xpGained = data.xpGained;

        if (Object.keys(updateQuery.$inc).length > 0) {
            await LearningHistory.findOneAndUpdate(
                { userId, date: today },
                updateQuery,
                { upsert: true, new: true }
            );
        }
    } catch (err) {
        console.error("❌ Lỗi khi cập nhật LearningHistory:", err);
    }
}

// Helper: Đảm bảo XP tuần được reset đúng lúc và cộng dồn
async function addXP(userId, xpGained) {
    const currentWeek = getCurrentWeekCode();
    const finalXP = Number(xpGained) || 0;
    if (finalXP <= 0) return;

    const user = await User.findById(userId);
    if (!user) return;

    let updateData = { $inc: { xp: finalXP } };

    // Nếu đã sang tuần mới, trao badge và reset
    if (user.lastResetWeek !== currentWeek) {
        await checkAndResetWeeklyXP(user);
        // Sau khi reset về 0, ta thiết lập lại dữ liệu update
        updateData = {
            $set: { weeklyXP: finalXP, lastResetWeek: currentWeek },
            $inc: { xp: finalXP }
        };
    } else {
        updateData.$inc.weeklyXP = finalXP;
    }

    // Thực hiện cập nhật và lấy user mới nhất
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    // Ghi nhận XP vào bảng lịch sử học tập
    await updateLearningHistory(userId, { xpGained: finalXP });

    console.log(`✅ [XP SYNC] ${updatedUser.username}: +${finalXP} XP. Total: ${updatedUser.xp}, Weekly: ${updatedUser.weeklyXP}`);
    return updatedUser;
}

app.get('/api/user/quiz/questions', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = Math.min(parseInt(req.query.limit) || 10, 30);

        const userVocabs = await UserVocab.find({ userId })
            .populate({ path: 'vocabId', model: 'Vocabulary' })
            .sort({ nextReviewDate: 1, box: 1 })
            .limit(limit)
            .lean();

        if (userVocabs.length < limit) {
            return res.status(400).json({
                message: `Sổ tay của bạn chỉ có ${userVocabs.length} từ, không đủ ${limit} câu hỏi.`,
                available: userVocabs.length
            });
        }

        const allOtherVocabs = await Vocabulary.find({
            _id: { $nin: userVocabs.map(uv => uv.vocabId?._id).filter(id => id != null) }
        }).limit(100).lean();

        const questions = await Promise.all(userVocabs.filter(uv => uv.vocabId).map(async (uv) => {
            const v = uv.vocabId;
            const box = uv.box;

            // Chỉ còn 2 level: Box 1-2 là Level 1, Box 3 trở lên là Level 2
            let level = (box >= 3) ? 2 : 1;

            let correctAnswer = "";
            let distractors = [];

            if (level === 1) {
                // LEVEL 1: Nghĩa (Tiếng Việt) -> Từ (Tiếng Anh)
                correctAnswer = v.word;
                distractors = allOtherVocabs
                    .filter(o => o.word !== v.word)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(o => o.word);
            } else {
                // LEVEL 2: Từ (Tiếng Anh) -> Nghĩa (Tiếng Việt)
                correctAnswer = v.meaning;
                distractors = allOtherVocabs
                    .filter(o => o.meaning !== v.meaning)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(o => o.meaning);
            }

            const options = [correctAnswer, ...distractors].sort(() => 0.5 - Math.random());

            return {
                uvId: uv._id,
                level,
                word: v.word || "",
                meaning: v.meaning || "",
                options: options || [],
                answer: correctAnswer
            };
        }));

        res.json({ questions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// API - FLASHCARD GAME
// ==========================================

// Lấy danh sách thẻ flashcard (ưu tiên từ cần ôn tập)
app.get('/api/user/flashcards', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        // Ưu tiên: từ cần ôn tập (nextReviewDate <= now) → sau đó lấy box thấp nhất
        const cards = await UserVocab.find({ userId })
            .populate({ path: 'vocabId', model: 'Vocabulary' })
            .sort({ nextReviewDate: 1, box: 1 })
            .limit(limit)
            .lean();

        const valid = cards
            .filter(c => c.vocabId != null)
            .map(c => ({
                uvId: c._id,
                vocabId: c.vocabId._id,
                word: c.vocabId.word,
                meaning: c.vocabId.meaning,
                example: c.vocabId.example,
                partOfSpeech: c.vocabId.partOfSpeech,
                difficulty: c.vocabId.difficulty,
                box: c.box,
                reviewCount: c.reviewCount,
                correctCount: c.correctCount
            }));

        res.json({ cards: valid, total: valid.length });
    } catch (error) {
        console.error("❌ Error fetching flashcards:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Ghi nhận kết quả ôn tập flashcard
app.post('/api/user/flashcards/review', authMiddleware, async (req, res) => {
    try {
        const { results } = req.body; // [{ uvId, isCorrect }]
        const userId = req.user._id;

        let correctTotal = 0;
        const REVIEW_INTERVALS = [0, 1, 3, 7, 14, 30]; // Ngày theo Leitner

        for (const r of results) {
            const uv = await UserVocab.findOne({ _id: r.uvId, userId });
            if (!uv) continue;

            uv.reviewCount += 1;

            if (r.isCorrect) {
                uv.correctCount += 1;
                uv.box = Math.min(uv.box + 1, 5); // Lên box cao hơn
                correctTotal++;
            } else {
                uv.box = Math.max(uv.box - 1, 1); // Rớt xuống box thấp hơn
            }

            // Tính ngày ôn tập tiếp theo
            const daysUntilReview = REVIEW_INTERVALS[uv.box] || 1;
            uv.nextReviewDate = new Date(Date.now() + daysUntilReview * 24 * 60 * 60 * 1000);

            await uv.save();
        }

        // Cộng XP và cập nhật streak
        const xpGained = correctTotal * 10;
        const updatedUser = await addXP(userId, xpGained);
        await updateStreak(userId);

        // Ghi nhận kết quả ôn tập vào lịch sử
        await updateLearningHistory(userId, { wordsReviewed: results.length, correctAnswers: correctTotal });

        // Lấy dữ liệu mới nhất sau khi update streak
        const finalUser = await User.findById(userId).select('streak xp weeklyXP').lean();

        io.emit('leaderboard_update');
        res.json({
            success: true,
            correctTotal,
            totalReviewed: results.length,
            xpGained,
            streak: finalUser.streak,
            xp: finalUser.xp,
            weeklyXP: finalUser.weeklyXP
        });
    } catch (error) {
        console.error("❌ Error saving review:", error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Ghi nhận kết quả Quiz
app.post('/api/user/quiz/review', authMiddleware, async (req, res) => {
    try {
        const { results, xpGained } = req.body;
        const userId = req.user._id;

        for (const r of results) {
            const uv = await UserVocab.findOne({ _id: r.uvId, userId });
            if (!uv) continue;
            uv.reviewCount += 1;
            if (r.isCorrect) {
                uv.correctCount += 1;
                uv.box = Math.min(uv.box + 1, 5);
            } else {
                uv.box = Math.max(uv.box - 1, 1);
            }
            const intervals = [0, 1, 2, 5, 10, 30];
            uv.nextReviewDate = new Date(Date.now() + (intervals[uv.box] || 1) * 24 * 60 * 60 * 1000);
            await uv.save();
        }

        const finalXP = Number(xpGained) || 0;
        await addXP(userId, finalXP);
        await updateStreak(userId);

        // Ghi nhận kết quả quiz vào lịch sử
        const correctCount = results.filter(r => r.isCorrect).length;
        await updateLearningHistory(userId, { wordsReviewed: results.length, correctAnswers: correctCount });

        const updatedUser = await User.findById(userId).select('streak xp weeklyXP').lean();
        io.emit('leaderboard_update');
        res.json({
            success: true,
            xpGained: finalXP,
            streak: updatedUser.streak,
            xp: updatedUser.xp,
            weeklyXP: updatedUser.weeklyXP
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Ghi nhận kết quả Match Game
app.post('/api/user/match/review', authMiddleware, async (req, res) => {
    try {
        const { xpGained } = req.body;
        const userId = req.user._id;
        const finalXP = Number(xpGained) || 0;

        await addXP(userId, finalXP);
        await updateStreak(userId);

        const updatedUser = await User.findById(userId).select('streak xp weeklyXP').lean();
        io.emit('leaderboard_update');
        res.json({
            success: true,
            xpGained: finalXP,
            streak: updatedUser.streak,
            xp: updatedUser.xp,
            weeklyXP: updatedUser.weeklyXP
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ==========================================
// USER SETTINGS & PROFILE
// ==========================================

// Cập nhật thông tin cơ bản
app.put('/api/user/profile', authMiddleware, async (req, res) => {
    try {
        const { name, avatar, dailyGoal } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: 'User không tồn tại' });

        if (name) user.name = name;
        if (avatar !== undefined) user.avatar = avatar;
        if (dailyGoal) user.dailyGoal = Number(dailyGoal);

        await user.save();
        res.json({ message: 'Cập nhật thành công', user: { name: user.name, avatar: user.avatar, dailyGoal: user.dailyGoal } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Cập nhật ngôn ngữ
app.put('/api/user/settings/languages', authMiddleware, async (req, res) => {
    try {
        const { uiLanguage, learningLanguage } = req.body;
        const user = await User.findById(req.user._id);

        if (uiLanguage) user.uiLanguage = uiLanguage;
        if (learningLanguage) user.learningLanguage = learningLanguage;

        await user.save();
        res.json({ message: 'Cập nhật ngôn ngữ thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Đổi mật khẩu
app.put('/api/user/settings/password', authMiddleware, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });

        // KHÔNG băm ở đây, để pre('save') hook của userSchema tự làm
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



// Root endpoint
app.get('/', (req, res) => {
    res.send('Hello from LingoVoyage Backend! 🌍');
});