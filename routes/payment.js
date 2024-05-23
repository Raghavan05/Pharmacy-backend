import express from 'express';
import { processPayment, sendStripeApi,cancelAndRefundPayment } from '../controllers/paymentController.js';
import { isAuthenticatedUser } from '../middlewares/authenticate.js';
const router = express.Router();

router.route('/payment/process').post( isAuthenticatedUser, processPayment);
router.route('/payment/cancel-refund/:paymentIntentId').post( isAuthenticatedUser, cancelAndRefundPayment);
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);


export default router;