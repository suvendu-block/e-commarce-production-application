import JWT from 'jsonwebtoken';
import User from '../models/user.model.js';

// Extracts and verifies Bearer JWT from Authorization header
// Attaches user doc (without password) to req.user on success
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];

        try {
            const decoded = JWT.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Requires that protect already ran and req.user.isAdmin === true
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();
    res.status(403).json({ message: 'Not authorized as admin' });
};

export { protect, admin };
