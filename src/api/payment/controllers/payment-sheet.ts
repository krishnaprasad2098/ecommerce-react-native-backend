/**
 * payment-sheet controller
 */
// import { Strapi } from 'strapi';

export default {
  async createPaymentSheet(ctx) {
    try {
      // Get amount from request body
      const { amount } = ctx.request.body;
      console.log(amount);

      if (!amount || isNaN(amount)) {
        return ctx.badRequest("Valid amount is required");
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

      console.log("creating customer");

      // Create a customer
      const customer = await stripe.customers.create();
      console.log("created customer");

      // Create ephemeral key
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-02-24.acacia" }
      );
      console.log("ephemeral created");

      console.log("Hit payment intent || payment sheet");

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount ? Math.floor(amount * 100) : 1000,
        currency: "INR",
        customer: customer.id,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(customer, ephemeralKey);

      // Return the response
      //   return {
      //     paymentIntent: paymentIntent.client_secret,
      //     ephemeralKey: ephemeralKey.secret,
      //     customer: customer.id,
      //     publishableKey: process.env.STRIPE_PUBLIC_KEY,
      //   };
      return ctx.send({
        paymentIntent: paymentIntent.client_secret,
        ephemeralKey: ephemeralKey.secret,
        customer: customer.id,
        publishableKey: process.env.STRIPE_PUBLIC_KEY,
      });
    } catch (error) {
      ctx.badRequest("Payment sheet creation failed", { error: error.message });
    }
  },
};
