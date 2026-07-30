import Joi from "joi";

// Ensures name/email/password meet min requirements before hitting the controller
export const registerSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
})

// All fields optional but at least one must be present
export const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    password: Joi.string().min(6),
}).min(1);
