import mongoose from "mongoose";

// Review is embedded in the product — a user writes a rating + comment
const reviewSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    }
}, { timestamps: true }
);

// Defines the Product shape stored in MongoDB
const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
    }, // URL-friendly name (auto-generated from name)
    image: {
        type: String,
    }, // Cloudinary URL (set later via upload route)
    brand: {
        type: String,
    },
    category: {
        type: String,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    countInStock: {
        type: Number,
        required: true,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0
    }, // aggregated average of all reviews
    numReviews: {
        type: Number,
        default: 0,
    },
    reviews: [reviewSchema]
}, { timestamps: true });

// Common query paths — helps MongoDB pick the right index
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
// Text index — powers the ?keyword= search on name + description
productSchema.index({ name: 'text', description: 'text' });

// Auto-generate slug from name if not provided (keeps slug always unique-safe)
productSchema.pre('validate', async function () {
    if (!this.slug && this.name) {
        this.slug = this.name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
});

export default mongoose.model('Product', productSchema);
