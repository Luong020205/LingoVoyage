// backend/index.js

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

mongoose.set('bufferCommands', false);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const MONGODB_URI = "mongodb+srv://luong1305960_db_user:nd1305tl@cluster0.m3tyt2p.mongodb.net/DoAn_LingoVoyage?appName=Cluster0";

// Schema cho Tỉnh thành
const provinceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    code: { type: String, required: true }
});

const Province = mongoose.model("Province", provinceSchema);

const startServer = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected to database: DoAn_LingoVoyage");

        app.listen(port, () => {
            console.log(`🚀 Server running at http://localhost:${port}`);
        });

    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
    }
};

startServer();


// API lấy danh sách tỉnh
app.get('/api/provinces', async (req, res) => {
    try {
        const provinces = await Province.find();
        console.log(`🔍 Found ${provinces.length} provinces`);
        res.json(provinces);
    } catch (error) {
        console.error("❌ Error fetching provinces:", error);
        res.status(500).json({ message: error.message });
    }
});


// API thêm tỉnh
app.post('/api/provinces', async (req, res) => {

    console.log("MongoDB state:", mongoose.connection.readyState);

    try {

        const province = new Province({
            name: req.body.name,
            slug: req.body.slug,
            code: req.body.code
        });

        const newProvince = await province.save();

        res.status(201).json(newProvince);

    } catch (error) {

        console.error(error);

        res.status(400).json({ message: error.message });

    }
});

app.get('/', (req, res) => {
    res.send('Hello from LingoVoyage Backend!');
});