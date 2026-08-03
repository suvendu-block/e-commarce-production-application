import express from 'express';
import dotenv from 'dotenv'
import {connectDB} from './config/db.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import { StartWorker } from './service/worker.service.js';













const app = express();
dotenv.config();
app.use(express.json());

const PORT = process.env.PORT || 5000










// 1. Request enters → /api/auth/* routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);









// 2. No matching route → 404
app.use(notFound);

// 3. Any error thrown along the way → caught here
app.use(errorHandler);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectDB();
    StartWorker();
})
