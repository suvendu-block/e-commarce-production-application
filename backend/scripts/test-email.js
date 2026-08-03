import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { connectDB } from '../config/db.js';
import User from '../models/user.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { sendOrderConfirmationEmail } from '../service/email.service.js';

const test = async () => {
    await connectDB();

    const user = await User.findOne({ email: 'john@example.com' });
    const product = await Product.findOne({});

    const order = await Order.create({
        user: user._id,
        orderItems: [{
            name: product.name,
            qty: 2,
            image: product.image,
            price: product.price,
            product: product._id,
        }],
        shippingAddress: { address: '123 Main St', city: 'Mumbai', postalCode: '400001', country: 'India' },
        paymentMethod: 'COD',
        itemsPrice: product.price * 2,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: product.price * 2,
    });

    console.log(`Test order created: ${order._id}`);
    const info = await sendOrderConfirmationEmail(user, order);

    if (info) {
        console.log('SEND: SUCCESS');
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) process.stdout.write(`PREVIEW_URL=${previewUrl}\n`);
    } else {
        console.log('SEND: FAILED');
    }

    await Order.deleteOne({ _id: order._id });
    await mongoose.connection.close();
    process.exit(0);
};

test();
