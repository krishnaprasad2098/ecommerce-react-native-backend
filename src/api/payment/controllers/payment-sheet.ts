/**
 * payment-sheet controller
 */

export default {
  async createPaymentSheet(ctx) {
    try {
      // Get amount from request body
      const body = ctx.request.body;
      if (!body || typeof body.amount === "undefined" || !body.name) {
        return ctx.badRequest("Valid amount and name are required");
      }
      const { amount, name }: { amount: number; name: string } = body;

      if (!amount || isNaN(amount) || !name || typeof name !== "string") {
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
      console.log(body.name);
      console.log(body.amount);

      // Create a customer
      const customer = await stripe.customers.create({
        name: body.name,
        address: {
          line1: "510 Townsend St",
          postal_code: "98140",
          city: "San Francisco",
          state: "CA",
          country: "US",
        },
      });

      console.log("created customer");

      // Create ephemeral key
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-03-31.basil" }
      );
      console.log("created ephemeral key");

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: body.amount ? Math.floor(body.amount * 100) : 1000,
        currency: "inr",
        customer: customer.id,
        // automatic_payment_methods: {
        //   enabled: true,
        // },
        payment_method_types: ["card"],

        description: "Ashwin Foods Test description.",
        shipping: {
          name: body.name,
          address: {
            line1: "510 Townsend St",
            postal_code: "98140",
            city: "San Francisco",
            state: "CA",
            country: "US",
          },
        },
      });

      console.log(customer, ephemeralKey);
      console.log("From paymentIntent console.log", paymentIntent.status);

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
