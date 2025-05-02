import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createPaymentIntent(req, res, next) {
    try {
        const { amount } = req.body;
        if (!amount) {
            return res.status(400).json({ error: "Missing payment amount." });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: "usd",
        });

        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        next(err);
    }
}
