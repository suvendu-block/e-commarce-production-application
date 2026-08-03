import express from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

// Memory storage — file never touches disk, streamed straight to Cloudinary
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only image files are allowed'));
    },
});

// POST /api/upload — admin uploads an image, returns Cloudinary URL
router.post('/', protect, admin, (req, res) => {
    // Callback style — multer errors (wrong type / too large) become 400s
    upload.single('image')(req, res, async (err) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'No image file provided' });

        const dataURI = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

        try {
            const result = await cloudinary.uploader.upload(dataURI, {
                folder: 'ecommerce/products',
            });
            res.status(201).json({ url: result.secure_url, publicId: result.public_id });
        } catch (error) {
            console.error('Upload failed:', JSON.stringify(error.error || error.message || error));
            res.status(500).json({ message: 'Upload failed' });
        }
    });
});

export default router;
