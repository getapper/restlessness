import Stripe from "stripe";

let stripeManager: StripeManager = null;

class StripeManager {
  stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY env var!");
    }
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2020-08-27",
    });
  }
}

export default () => {
  if (stripeManager === null) {
    stripeManager = new StripeManager();
  }
  return stripeManager;
};
