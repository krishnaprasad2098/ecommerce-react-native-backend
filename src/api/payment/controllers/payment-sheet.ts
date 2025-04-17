/**
 * payment-sheet controller
 */

export default {
  async createPaymentSheet(ctx) {
    try {
      // Get amount from request body
      const body = ctx.request.body;
      if (!body || typeof body.amount === "undefined") {
        return ctx.badRequest("Valid amount and name are required");
      }
      const { amount }: { amount: number } = body;

      if (!amount || isNaN(amount)) {
        return ctx.badRequest("Valid amount and name are required");
      }
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      console.log(process.env.STRIPE_SECRET_KEY);
      console.log(
        "Using STRIPE_SECRET_KEY:",
        process.env.STRIPE_SECRET_KEY ? "Key exists" : "Key missing"
      );

      if (!stripe) {
        return ctx.internalServerError("Stripe configuration is missing");
      }

      // Create a customer
      const customer = await stripe.customers.create();

      // Create ephemeral key
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-03-31.basil" }
      );

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount ? Math.floor(amount * 100) : 1000,
        currency: "inr",
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },

        description: "Ashwin Foods Test description.",
      });

      console.log(customer, ephemeralKey);

      // Return the response
      return {
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLIC_KEY,
      };
    } catch (error) {
      ctx.badRequest("Payment sheet creation failed", { error: error.message });
    }
  },
};
