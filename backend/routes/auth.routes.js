import express from 'express';
import {
    registerUser,
    loginUser,
    getUserProfile,
    updateUserProfile
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import rateLimiter from '../middleware/rateLimiter.middleware.js'
import { registerSchema, loginSchema, updateProfileSchema } from '../validators/auth.validators.js';

const router = express.Router();

// Inline middleware — validates req.body against a Joi schema before the controller runs
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: error.details.map(d => d.message).join(', '),
    });
  }
  next();
};

// Request flow: validate body → run controller
router.post('/register', rateLimiter(), validate(registerSchema), registerUser);
router.post('/login', rateLimiter(), validate(loginSchema), loginUser);
// /profile requires a valid JWT (protect) before accessing the controller
router.route('/profile').get(protect, rateLimiter(), getUserProfile).put(protect, rateLimiter(), validate(updateProfileSchema), updateUserProfile);

export default router;