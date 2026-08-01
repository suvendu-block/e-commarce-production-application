import Joi from "joi";

// All fields optional but at least one must be present
export const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email(),
    isAdmin: Joi.boolean(),
}).min(1); // reject empty update bodies
