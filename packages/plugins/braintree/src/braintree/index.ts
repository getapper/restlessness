import * as braintreeSdk from 'braintree';
import {
    BraintreeGateway,
    Customer,
    CustomerCreateRequest, Discount,
    GatewayConfig,
    PaymentMethod, Plan,
    Subscription,
    ValidatedResponse,
} from 'braintree';


export interface AddPaymentToCustomerData {
    customerId: string,
    nonce: string,
    cardholderName: string,
    cvv: string,
    number: string,
    expirationMonth: string,
    expirationYear: string,
}

class Braintree {
    gateway: BraintreeGateway;

    init() {
        const environment = process.env.RLN_BRAINTREE_IS_SANDBOX ? braintreeSdk.Environment.Sandbox : braintreeSdk.Environment.Production;
        const merchantId = process.env.RLN_BRAINTREE_MERCHANT_ID;
        const publicKey = process.env.RLN_BRAINTREE_PUBLIC_KEY;
        const privateKey = process.env.RLN_BRAINTREE_PRIVATE_KEY;

        const braintreeGatewayConfig: GatewayConfig = {
            environment,
            merchantId,
            publicKey,
            privateKey,
        };

        this.gateway = new braintreeSdk.BraintreeGateway(braintreeGatewayConfig);
    }

    async createCustomer(customerInfo: CustomerCreateRequest): Promise<ValidatedResponse<Customer>> {
      const customerGateway = this.gateway.customer;
      return await customerGateway.create(customerInfo);
    }

    async getCustomerById(customerId: string) {
        const customerGateway = this.gateway.customer;

        try {
            return await customerGateway.find(customerId);
        } catch (e) {
            return null;
        }
    };

    async deleteCustomer(customerId: string): Promise<boolean> {
        const customerGateway = this.gateway.customer;
        try {
            await customerGateway.delete(customerId);
            return true;
        } catch (e) {
            return false;
        }
    }

    async addPaymentMethodToCustomer(data: AddPaymentToCustomerData): Promise<ValidatedResponse<PaymentMethod>> {
        const paymentMethodGateway = this.gateway.paymentMethod;

        try {
            return await paymentMethodGateway.create({
                customerId: data.customerId,
                paymentMethodNonce: data.nonce,
                cardholderName: data.cardholderName,
                number: data.number,
                expirationMonth: data.expirationMonth,
                expirationYear: data.expirationYear,
                cvv: data.cvv,
            });
        } catch (e) {
            console.log(e);
            throw e;
        }
    }

    async getUserDefaultPaymentToken(customerId: string) {
        const customer = await this.getCustomerById(customerId);

        if (!customer) return null;

        const defaultPaymentMethod = customer.paymentMethods[0] ?? null;
        return defaultPaymentMethod?.token ?? null;
    }

    async getAllSubscriptionPlans(): Promise<Plan[]> {
        return (await this.gateway.plan.all()).plans;
    };

    async createSubscription(planId: string, customerId: string, paymentToken: string, discounts: Discount[]): Promise<ValidatedResponse<Subscription> | {success: boolean, message: string}> {
        if (await this.isAlreadySubscribed(planId, customerId)) {
            return {
                success: false,
                message: 'User is already subscribed',
            };
        }

        return await this.gateway.subscription.create({
            planId: planId,
            paymentMethodToken: paymentToken,
            discounts: {
                add: discounts.map(d => ({
                    inheritedFromId: d.id,
                    amount: d.amount,
                })),
            },
        });
    }

    async isAlreadySubscribed(planId: string, customerId: string): Promise<boolean> {
        const customer = await this.getCustomerById(customerId);
        return customer.creditCards.some(cc => cc.subscriptions.some(sub => sub.planId === planId),
        );
    }

    async _getDiscounts(): Promise<Discount[]> {
        const discountsGateway = braintree.gateway.discount;
        const discounts = await discountsGateway.all();
        console.log(discounts);
        return discounts;
    }

    async getDiscountByName(discountName: string): Promise<Discount | undefined> {
        const discounts = await this._getDiscounts();
        return discounts.find((d) => d.name.toLowerCase() === discountName.toLowerCase());
    }

    async test() {}
}

const braintree = new Braintree();

export default () => {
    braintree.init();
    return braintree;
};