import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";

// GET /api/users — admin lists all users (password excluded)
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// GET /api/users/:id — admin gets one user
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (user) {
        return res.json(user);
    }

    res.status(404);
    throw new Error('User not found');
});

// PUT /api/users/:id — admin edits name / email / isAdmin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;

    if (req.body.isAdmin !== undefined) {
        user.isAdmin = req.body.isAdmin;
    }

    const updated = await user.save();
    res.json({
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        isAdmin: updated.isAdmin,
    });
});

// DELETE /api/users/:id — admin removes a user
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await user.deleteOne();
    res.json({ message: 'User removed' });
});

export { getUsers, getUserById, updateUser, deleteUser };
