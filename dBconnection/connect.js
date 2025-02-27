const mongoose = require("mongoose");
require("dotenv").config();

const dBConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI );
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection failed:", error);
     
    }
};

module.exports = dBConnect;
