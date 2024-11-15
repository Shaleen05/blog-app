import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
        minLength: 6
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    role: {
        type: String,
        enum: ['Admin', 'Member'],
        required: true
    }
});

const User = mongoose.model("User", userSchema);

export default User;