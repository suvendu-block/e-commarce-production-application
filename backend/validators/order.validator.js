import Joi from 'joi';

// Shipping address is required for every order
const shippingAddressSchema = Joi.object({
    address: Joi.string().min(3).max(200).required(),
    city: Joi.string().min(2).max(50).required(),
    postalCode: Joi.string().min(2).max(20).required(),
    country: Joi.string().min(2).max(50).required(),
});

// Client sends only product ids + qty — prices are re-fetched server-side
export const createOrderSchema = Joi.object({
    orderItems: Joi.array()
        .items(
            Joi.object({
                product: Joi.string().required(), // product ObjectId
                qty: Joi.number().integer().min(1).required(),
            })
        )
        .min(1) // reject empty carts
        .required(),
    shippingAddress: shippingAddressSchema.required(),
    paymentMethod: Joi.string().valid('Stripe', 'PayPal', 'COD').required(),
});

// Payment provider callback details — all optional until a provider is integrated
export const payOrderSchema = Joi.object({
    paymentResult: Joi.object({
        id: Joi.string(),
        status: Joi.string(),
        updateTime: Joi.string(),
        emailAddress: Joi.string().email(),
    }),
});
