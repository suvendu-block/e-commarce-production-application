import express from 'express'
import {
    getProductById,
    getProducts,
    getTopProducts,
    createProduct,
    updateProduct,
    DeleteProduct,
    createReview
} from '../controllers/product.controller.js';

import { protect, admin } from '../middleware/auth.middleware.js';
import {
    createProductSchema,
    updateProductSchema,
    reviewSchema
} from '../validators/product.validator.js';

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

// Public: list products · Admin: create product
router
    .route('/')
    .get(getProducts)
    .post(protect, admin, validate(createProductSchema), createProduct);

// Must be registered BEFORE /:id so "top" isn't treated as an id
router.get('/top', getTopProducts);

// Public: get one · Admin: update / delete
router
    .route('/:id')
    .get(getProductById)
    .put(protect, admin, validate(updateProductSchema), updateProduct)
    .delete(protect, admin, DeleteProduct);

// User: add a review (requires login)
router.post('/:id/reviews', protect, validate(reviewSchema), createReview);

export default router;
