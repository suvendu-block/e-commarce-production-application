import { sendOrderConfirmationEmail } from './email.service.js';
import { orderConfirmationQueue, invertorySyncQueue } from './queue.service.js';
import Order from '../models/order.model.js';
import User from '../models/user.model.js';



export const StartWorker = () => {
    orderConfirmationQueue.process(async (job) => {
        const order = await Order.findById(job.data.orderId);
        if (!order) {
            throw new Error(`Order with ID ${job.data.orderId} not found`);
        }
        const user = await User.findById(order.user);
        if (!user) {
            throw new Error(`User with ID ${order.user} not found`);
        }
        await sendOrderConfirmationEmail(user, order);
    })


    invertorySyncQueue.process(async (job) => {
        const order = await Order.findById(job.data.orderId).populate('orderItems.product');
        if (!order) {
            throw new Error(`Order with ID ${job.data.orderId} not found`);
        }
        const flagged = order.orderItems.filter((i) => i.product.countInStock < i.qty);
        if (flagged.length) {
            console.warn(`Inventory sync warning: Order ${order._id} has items with insufficient stock:`, flagged.map(i => i.product.name).join(', '));
        }

        console.log(`Inventory sync completed for order ${order._id} : ${flagged.length ? "flagged" : "OK"}`);
    })
}