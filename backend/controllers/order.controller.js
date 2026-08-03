import asyncHandler from '../utils/asyncHandler.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { enqueueOrderJobs } from '../service/queue.service.js';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING = 10;

// POST /api/orders — place an order; prices computed from DB, never from client
const createOrder = asyncHandler(async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    // Re-fetch products from DB — client only sent ids + qty
    const productIds = orderItems.map((item) => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // Build line items from DB data, verifying every product + stock level
    const items = [];
    for (const item of orderItems) {
        const product = productMap.get(item.product.toString());

        if (!product) {
            res.status(400);
            throw new Error('One or more products not found');
        }

        if (product.countInStock < item.qty) {
            res.status(400);
            throw new Error(`Insufficient stock for ${product.name}`);
        }

        items.push({
            name: product.name,
            qty: item.qty,
            image: product.image,
            price: product.price, // price snapshot at purchase time
            product: product._id,
        });
    }

    // Price breakdown: items + 8% tax + shipping (free over $100)
    const itemsPrice = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const taxPrice = +(itemsPrice * TAX_RATE).toFixed(2);
    const shippingPrice = itemsPrice > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
    const totalPrice = +(itemsPrice + taxPrice + shippingPrice).toFixed(2);

    const order = await Order.create({
        user: req.user._id,
        orderItems: items,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    // Decrement stock right away (inventory:sync queue job can double-check later)
    for (const item of items) {
        await Product.updateOne({ _id: item.product }, { $inc: { countInStock: -item.qty } });
    }
    enqueueOrderJobs(order); // enqueue order confirmation + inventory sync jobs

    res.status(201).json(order);
});

// GET /api/orders/:id — owner or admin only
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const isOwner = order.user._id.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to view this order');
    }

    res.json(order);
});

// PUT /api/orders/:id/pay — mark paid + store provider result
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const isOwner = order.user.toString() === req.user._id.toString();
    if (!isOwner && !req.user.isAdmin) {
        res.status(403);
        throw new Error('Not authorized to pay this order');
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = req.body.paymentResult || {};

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// PUT /api/orders/:id/deliver — admin marks the order as delivered
const updateOrderToDelivered = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

// GET /api/orders/myorders — logged-in user's order history
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
});

// GET /api/orders — admin sees every order, newest first
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
});

export {
    createOrder,
    getOrderById,
    updateOrderToPaid,
    updateOrderToDelivered,
    getMyOrders,
    getOrders,
};
