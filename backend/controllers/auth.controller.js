import asyncHandler from "../utils/asyncHandler.js";
import genrateToken from "../utils/genratetoken.js";
import User from "../models/user.model.js";

// POST /api/auth/register — create account, return JWT
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: genrateToken(user._id),
    });
});

// POST /api/auth/login — authenticate, return JWT
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: genrateToken(user._id),
        });
    }

    res.status(401);
    throw new Error('Invalid email or password');
});

// GET /api/auth/profile — fetch own profile (requires auth middleware)
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        return res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        });
    }

    res.status(404);
    throw new Error('User not found');
});

// PUT /api/auth/profile — update own profile (requires auth middleware)
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if (req.body.password) {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        return res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: genrateToken(updatedUser._id),
        });
    }

    res.status(404);
    throw new Error('User not found');
});

export { registerUser, loginUser, getUserProfile, updateUserProfile };
