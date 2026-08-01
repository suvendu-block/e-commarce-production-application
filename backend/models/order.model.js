import mongoose from "mongoose";

// One line item inside an order — a snapshot of the product at purchase time
const orderItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    }, // product name (snapshot — product may change later)
    qty: {
        type: Number,
        required: true,
        min: 1,
    },
    image: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
    }, // price at the time of purchase
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
});

// Where the order gets shipped
const shippingAddressSchema = mongoose.Schema({
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    postalCode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
});

// Defines the Order shape stored in MongoDB
const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }, // who placed the order
    orderItems: [orderItemSchema],
    shippingAddress: {
        type: shippingAddressSchema,
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['Stripe', 'PayPal', 'COD'],
    },
    paymentResult: {
        // filled in by the payment provider on success
        id: String,
        status: String,
        updateTime: String,
        emailAddress: String,
    },
    itemsPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    taxPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    shippingPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
}, { timestamps: true });

// Common query paths — "my orders" (user) and admin dashboards (createdAt)
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model('Order', orderSchema);
