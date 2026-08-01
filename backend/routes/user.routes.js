import express from 'express';
import {
    getUsers,
    getUserById,
    updateUser,
    deleteUser
} from '../controllers/user.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { updateUserSchema } from '../validators/user.validator.js';

const router = express.Router();

// Inline middleware — validates req.body against a Joi schema before the controller runs
const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: error.details.map((d) => d.message).join(', '),
        });
    }
    next();
};

// Every route is admin-only
router.route('/').get(protect, admin, getUsers);

router
    .route('/:id')
    .get(protect, admin, getUserById)
    .put(protect, admin, validate(updateUserSchema), updateUser)
    .delete(protect, admin, deleteUser);

export default router;
