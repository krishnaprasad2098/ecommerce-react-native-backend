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
      const {
        amount,
        name,
        address,
        city,
        state,
        country,
        pincode,
      }: {
        amount: number;
        name: string;
        address: string;
        city: string;
        state: string;
        country: string;
        pincode: string;
      } = body;

      if (
        !amount ||
        isNaN(amount) ||
        !name ||
        typeof name !== "string" ||
        !address ||
        typeof address !== "string" ||
        !city ||
        typeof city !== "string" ||
        !state ||
        typeof state !== "string" ||
        !country ||
        typeof country !== "string" ||
        !pincode ||
        typeof pincode !== "string"
      ) {
        return ctx.badRequest(
          "Valid amount,name,address,city,state,country,pincode are required"
        );
      }
      const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
      console.log(
        "Using STRIPE_SECRET_KEY:",
        process.env.STRIPE_SECRET_KEY ? "Key exists" : "Key missing"
      );

      if (!stripe) {
        return ctx.internalServerError("Stripe configuration is missing");
      }

      // Create a customer
      const customer = await stripe.customers.create({
        name: body.name,
        address: {
          line1: body.address,
          postal_code: body.pincode,
          city: body.city,
          state: body.state,
          country: body.country,
        },
      });

      // Create ephemeral key
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: customer.id },
        { apiVersion: "2025-03-31.basil" }
      );

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
            line1: body.address,
            postal_code: body.pincode,
            city: body.city,
            state: body.state,
            country: body.country,
          },
        },
      });

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
