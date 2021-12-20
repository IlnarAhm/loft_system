const mongoose = require("mongoose");

const start = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/loft_system");
    } catch (err) {
        throw new Error(err.message);
    }
};

start()
    .then(() => console.log('MongoDB connected!'))
    .catch((err) => console.error(err));