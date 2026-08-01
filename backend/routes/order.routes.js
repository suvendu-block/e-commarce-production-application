import express from 'express';
import {
    createOrder,
    getMyOrders,
    getOrderById,
    updateOrderToPaid,
    getOrders,
    updateOrderToDelivered,
} from '../controllers/order.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';
import { createOrderSchema, payOrderSchema } from '../validators/order.validator.js';

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

// User: place order · Admin: list all orders
router
    .route('/')
    .post(protect, validate(createOrderSchema), createOrder)
    .get(protect, admin, getOrders);

// Must be registered BEFORE /:id so "myorders" isn't treated as an id
router.get('/myorders', protect, getMyOrders);

router.get('/:id', protect, getOrderById);
router.put('/:id/pay', protect, validate(payOrderSchema), updateOrderToPaid);
router.put('/:id/deliver', protect, admin, updateOrderToDelivered);

export default router;
