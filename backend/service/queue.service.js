import Queue from 'bull';

const orderConfirmationQueue = new Queue('order-confirmation', {
    redis: process.env.REDIS_URL
});

const invertorySyncQueue = new Queue('inventory-sync', {
    redis: process.env.REDIS_URL
});

export const enqueueOrderJobs = async (order) => {
    if (process.env.NODE_ENV === 'test') return;

    try {
        await orderConfirmationQueue.add({ orderId: order._id }, { attempts: 3, backoff: 5000 });
        await invertorySyncQueue.add({ orderId: order._id });
        console.log(`Enqueued order confirmation and inventory sync jobs for order ${order._id}`);
    } catch (error) {
        console.error(`Error enqueuing order jobs for order ${order._id}:`, error);
    }
}

export { orderConfirmationQueue, invertorySyncQueue };