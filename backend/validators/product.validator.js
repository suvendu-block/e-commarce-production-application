import Joi from "joi";

// Full set of fields required for creating a product
export const createProductSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    price: Joi.number().positive().required(),
    description: Joi.string().max(2000),
    image: Joi.string().allow(''), // optional until an image is uploaded
    brand: Joi.string().max(50),
    category: Joi.string().max(50),
    countInStock: Joi.number().integer().min(0),
})

// Same shape but all optional — only submitted fields get updated
export const updateProductSchema = Joi.object({
    name: Joi.string().min(2).max(100),
    price: Joi.number().positive(),
    description: Joi.string().max(2000),
    image: Joi.string().allow(''),
    brand: Joi.string().max(50),
    category: Joi.string().max(50),
    countInStock: Joi.number().integer().min(0),
}).min(1) // reject empty update bodies

export const reviewSchema = Joi.object({
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().min(3).max(1000).required(),
})
