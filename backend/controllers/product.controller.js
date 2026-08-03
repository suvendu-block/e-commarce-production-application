import asyncHandler from "../utils/asyncHandler.js";
import Product from '../models/product.model.js';

const PAGE_SIZE = 10;

// Turns "Test Phone" into "test-phone" for the unique slug
const slugify = (name) =>
    name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

// GET /api/products — list with ?keyword=&page=&pageSize=&category=&minPrice=&maxPrice=
const getProducts = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || PAGE_SIZE;

    // Build MongoDB filter from query params
    const filter = {};

    if (req.query.keyword) {
        filter.$text = { $search: req.query.keyword }; // text index search
    }

    if (req.query.category) {
        filter.category = req.query.category;
    }

    const minPrice = Number(req.query.minPrice);
    const maxPrice = Number(req.query.maxPrice);
    const hasMin = Number.isFinite(minPrice);
    const hasMax = Number.isFinite(maxPrice);

    if (hasMin || hasMax) {
        filter.price = {}
        if (hasMin) filter.price.$gte = minPrice;
        if (hasMax) filter.price.$lte = maxPrice;
    }

    // Count first (for total pages), then fetch one page
    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .sort('-rating')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    return res.json({
        products, page, pages: Math.ceil(count / pageSize), count
    })
})

// GET /api/products/:id — single product with reviewer names populated
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name');

    if (product) {
        return res.json(product);
    }

    res.status(404);
    throw new Error('Product not found');
})

// GET /api/products/top — 5 highest-rated products for the homepage carousel
const getTopProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({}).sort({ rating: -1 }).limit(5);
    res.json(products)
})

// POST /api/products — admin creates a product, slug auto-generated
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, brand, category, countInStock } = req.body;

    const product = await Product.create({
        name,
        slug: slugify(name),
        price,
        description,
        image,
        brand,
        category,
        countInStock: countInStock ?? 0,
    });

    return res.status(201).json(product)
})

// PUT /api/products/:id — admin updates only the fields that were sent
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const nameChanged = req.body.name && req.body.name !== product.name;

        // ?? keeps values like 0 instead of falling back to the old value
        product.name = req.body.name ?? product.name;
        product.price = req.body.price ?? product.price;
        product.description = req.body.description ?? product.description;
        product.image = req.body.image ?? product.image;
        product.brand = req.body.brand ?? product.brand;
        product.category = req.body.category ?? product.category;
        product.countInStock = req.body.countInStock ?? product.countInStock

        // Keep slug in sync if the name changed (checked BEFORE assignment)
        if (nameChanged) {
            product.slug = slugify(req.body.name);
        }

        const updated = await product.save();
        return res.json(updated);
    }

    res.status(404);
    throw new Error('Product not found');
})

// DELETE /api/products/:id — admin removes a product
const DeleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne();
        return res.json({ message: 'Product removed' });
    }

    res.status(404);
    throw new Error('Product not found');
})

// POST /api/products/:id/reviews — logged-in user adds one review per product
const createReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Block a second review from the same user
    const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
        res.status(400);
        throw new Error('Product already reviewed');
    }

    product.reviews.push({
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    });

    // Recompute aggregate rating + count from all reviews
    product.numReviews = product.reviews.length;
    product.rating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
})

export {
    getProducts,
    getProductById,
    getTopProducts,
    createProduct,
    updateProduct,
    DeleteProduct,
    createReview,
}
