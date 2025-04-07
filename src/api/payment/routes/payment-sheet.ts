/**
 * payment-sheet router
 */

export default {
  routes: [
    {
      method: "POST",
      path: "/payment-sheet",
      handler: "payment-sheet.createPaymentSheet",
      config: {
        policies: [],
        middlewares: [],
        auth: false,
      },
    },
  ],
};
