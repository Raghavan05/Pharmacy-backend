import catchAsyncError from '../middlewares/catchAsyncError.js';
import Stripe from "stripe";

const stripe = Stripe("sk_test_51Mj2DuSH5jEtpQaRT5ewpT36dHujiB6vqqPMwFh0gLh9x16OMlT2Ghooh4xm1GTG9aCBvNor7NpENDmySX6g0IGc00bfRDUA1y")

export const processPayment  = catchAsyncError(async(req, res, next) => {
    const paymentIntent = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
        description: "TEST PAYMENT",
        metadata: { integration_check: "accept_payment"},
        shipping: req.body.shipping
    })

    res.status(200).json({
        success: true,
        client_secret: paymentIntent.client_secret
    })
})


export const cancelAndRefundPayment = catchAsyncError(async (req, res, next) => {
    const { paymentIntentId } = req.params;

    try {
        // Retrieve the payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Check if the payment intent is refundable
        if (paymentIntent.status === 'succeeded') {
            // Refund the payment intent
            const refund = await stripe.refunds.create({
                payment_intent: paymentIntentId,
            });

            // Log the refund details
            console.log('Refund details:', refund);
            res.status(200).json({
                success: true,
                message: 'Payment canceled and refunded successfully.',
            });
        } else {
            console.log('Payment is not refundable.');
            res.status(400).json({
                success: false,
                message: 'Payment is not refundable.',
            });
        }
    } catch (error) {
        console.error('Error canceling and refunding payment:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error.',
        });
    }
});


export const sendStripeApi  = catchAsyncError(async(req, res, next) => {
    res.status(200).json({
        stripeApiKey: process.env.STRIPE_API_KEY
    })
})