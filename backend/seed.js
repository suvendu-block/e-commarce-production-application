import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import User from './models/user.model.js';
import Product from './models/product.model.js';
import Order from './models/order.model.js';

// Passwords are hashed automatically by the User model's pre-save hook
const users = [
    { name: 'Admin User', email: 'admin@example.com', password: 'admin123', isAdmin: true },
    { name: 'John Doe', email: 'john@example.com', password: 'john123', isAdmin: false },
];

// 12 products across 5 categories (category names must match frontend filter later)
const products = [
    { name: 'iPhone 15 Pro', brand: 'Apple', category: 'Electronics', price: 1299, countInStock: 20, description: 'Titanium frame, A17 Pro chip, pro camera system.', reviews: [{ name: 'John Doe', rating: 5, comment: 'Best phone I have owned.' }, { name: 'John Doe', rating: 4, comment: 'Battery could be better.' }] },
    { name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Electronics', price: 1099, countInStock: 15, description: 'Galaxy AI, 120Hz AMOLED display.' },
    { name: 'Sony WH-1000XM5 Headphones', brand: 'Sony', category: 'Electronics', price: 399, countInStock: 30, description: 'Industry-leading noise cancelling, 30-hour battery.', reviews: [{ name: 'John Doe', rating: 5, comment: 'Noise cancelling is unreal.' }, { name: 'John Doe', rating: 5, comment: 'Super comfortable.' }] },
    { name: 'MacBook Air M3', brand: 'Apple', category: 'Electronics', price: 1499, countInStock: 10, description: '13.6-inch Liquid Retina, 18-hour battery life.' },
    { name: "Levi's 501 Jeans", brand: "Levi's", category: 'Clothing', price: 89.5, countInStock: 50, description: 'Classic straight-fit denim, 100% cotton.' },
    { name: 'Nike Air Max 270', brand: 'Nike', category: 'Clothing', price: 150, countInStock: 40, description: 'Air cushioning with a stylish lifestyle look.' },
    { name: 'Adidas Ultraboost Light', brand: 'Adidas', category: 'Clothing', price: 180, countInStock: 25, description: 'Lightest Ultraboost ever, energy-returning midsole.' },
    { name: 'Ninja Foodi Air Fryer', brand: 'Ninja', category: 'Home & Kitchen', price: 199, countInStock: 18, description: 'Air fry, roast, broil and dehydrate in one.', reviews: [{ name: 'John Doe', rating: 4, comment: 'Crispy fries every time.' }] },
    { name: 'Dyson V15 Detect', brand: 'Dyson', category: 'Home & Kitchen', price: 749, countInStock: 8, description: 'Cordless vacuum with laser dust detection.' },
    { name: 'Yeti Rambler Tumbler 30oz', brand: 'Yeti', category: 'Home & Kitchen', price: 39.95, countInStock: 100, description: 'Keeps drinks cold for hours, dishwasher safe.' },
    { name: 'Kindle Paperwhite', brand: 'Amazon', category: 'Books', price: 149.99, countInStock: 35, description: '6.8-inch glare-free display, 10 weeks of battery.' },
    { name: 'Wilson NBA Official Basketball', brand: 'Wilson', category: 'Sports', price: 29.99, countInStock: 60, description: 'Official game ball used in the NBA.' },
];

const seed = async () => {
    try {
        await connectDB();

        // Wipe everything first (clean slate per design doc)
        await Order.deleteMany({});
        await Product.deleteMany({});
        await User.deleteMany({});

        // create() runs the pre-save hook → passwords get bcrypt-hashed
        const createdUsers = await User.create(users);
        const regularUser = createdUsers[1];

        // Build products: auto slug (model hook), placeholder image,
        // embed reviews with the seeded user + compute rating/numReviews
        const sampleProducts = products.map((p) => {
            const reviews = (p.reviews || []).map((r) => ({
                user: regularUser._id,
                name: r.name,
                rating: r.rating,
                comment: r.comment,
            }));
            return {
                name: p.name,
                brand: p.brand,
                category: p.category,
                price: p.price,
                countInStock: p.countInStock,
                description: p.description,
                image: `https://placehold.co/600x400?text=${encodeURIComponent(p.name)}`,
                reviews,
                rating: reviews.length
                    ? +(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : 0,
                numReviews: reviews.length,
            };
        });

        await Product.create(sampleProducts);

        console.log('Seed completed:');
        console.log(`  Users:   ${createdUsers.length} (admin@example.com/admin123, john@example.com/john123)`);
        console.log(`  Products: ${sampleProducts.length}`);
    } catch (error) {
        console.error(`Seed failed: ${error.message}`);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

seed();
