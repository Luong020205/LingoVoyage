const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb+srv://luong1305960_db_user:nd1305tl@cluster0.m3tyt2p.mongodb.net/DoAn_LingoVoyage?appName=Cluster0';

async function fix() {
    await mongoose.connect(MONGODB_URI);
    const User = mongoose.model('User', new mongoose.Schema({ username: String, badges: Object }));
    await User.findOneAndUpdate({ username: 'luong' }, { $set: { 'badges.gold': 1, 'badges.silver': 0, 'badges.bronze': 0 } });
    console.log('✅ Fixed badges for user luong');
    process.exit(0);
}

fix();
