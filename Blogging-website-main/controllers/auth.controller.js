import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt

    if (!token) {
        return res.status(403).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

const generateJWT = (userId) => {
    return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: '2h' });
};

export const signup = async (req, res) => {
    try {
        const { userName, password, email, role } = req.body;
        const existingUser = await User.findOne({ userName: userName });

        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 5);
        const newUser = await User.create({ userName, password: hashedPassword, email, role });

        res.status(201).json({ message: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const signin = async (req, res) => {
    const { userName, password } = req.body;
    const foundUser = await User.findOne({ userName });

    if (!foundUser) {
        return res.status(400).json({ error: "Please signup first" });
    }

    const matched = await bcrypt.compare(password, foundUser.password);
    if (matched) {
        try {
            const token = generateJWT(foundUser._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: 2 * 24 * 60 * 60 * 1000, sameSite: 'strict' });
            res.redirect('/home');
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    } else {
        res.status(400).json({ error: "Incorrect password" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie('jwt', '', { maxAge: 0 });
        res.redirect('/');
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};
