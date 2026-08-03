import nodemailer from 'nodemailer';


let transporter;


const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
    }

    return transporter;
}



export const sendOrderConfirmationEmail = async (user, order) => {
    if (process.env.NODE_ENV === 'test' || !process.env.EMAIL_HOST) return null;

    try {
        const itemsHTML = order.orderItems
            .map(item => `<li>${item.name} - ${item.qty} x $${item.price}</li>`)
            .join('');
        const info = await getTransporter().sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: user.email,
            subject: `Order ${order._id} confirmation`,
            html: `
                <h1>Thank you for your order!</h1>
                <p>Your order ID is ${order._id}.</p>
                <ul>${itemsHTML}</ul>
                <p>Total: $${order.totalPrice}</p>
            `
        })
        console.log(`Order confirmation email sent to ${user.email} for order ${order._id} (id: ${info.messageId})`);
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) console.log(`Email preview: ${previewUrl}`);
        return info;
    } catch (error) {
        console.error(`Failed to send order confirmation email to ${user.email} for order ${order._id}:`, error);
        return null;
    }
}
