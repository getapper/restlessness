import * as braintreeSdk from 'braintree';
import {
    BraintreeGateway,
    ClientTokenRequest,
    Customer,
    CustomerCreateRequest,
    Discount,
    GatewayConfig,
    PaymentMethod,
    Plan,
    Subscription, SubscriptionRequest,
    SubscriptionStatus,
    Transaction,
    ValidatedResponse
} from 'braintree';

export enum BraintreeError {
    USER_ALREADY_SUBSCRIBED_TO_PLAN,
    USER_NOT_FOUND,
}

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
        const environment = process.env.RLN_BRAINTREE_IS_SANDBOX === 'true' ? braintreeSdk.Environment.Sandbox : braintreeSdk.Environment.Production;
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

    async generateClientToken(customerId: string): Promise<string> {
        const options: ClientTokenRequest = {
            customerId,
        };

        const tokenResponse = await this.gateway.clientToken.generate(options);
        return tokenResponse.success ? tokenResponse.clientToken : null;
    }

    async getCustomerById(customerId: string): Promise<braintreeSdk.Customer> {
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

    async getAllSubscriptionPlans(): Promise<Plan[]> {
        return (await this.gateway.plan.all()).plans;
    };

    async getPlanById(planId: string): Promise<Plan> {
        const plans = await this.getAllSubscriptionPlans();
        return plans.find(plan => plan.id === planId);
    }

    // Now this method accepts every param that Braintree endpoint can accept
    async createSubscription(createSubProps: SubscriptionRequest, paymentMethodNonce: string): Promise<Subscription> {
        const outcome = await this.gateway.subscription.create({
            ...createSubProps,
            paymentMethodNonce,
        });

        if (outcome.success) return outcome.subscription;
        return null;
    }

    async getUserSubscriptions(customerId: string): Promise<Subscription[]> {
        const customer = await this.gateway.customer.find(customerId);
        return customer.paymentMethods.reduce((accumulator: Subscription[], pm) => {
            const currentSubs = pm.subscriptions ?? [];
            return [...accumulator, ...currentSubs];
        }, []);
    }

    async getUserTransactions(customerId: string): Promise<Transaction[]> {
        const subscriptions = await this.getUserSubscriptions(customerId);

        return subscriptions.reduce(
            (accumulator: Transaction[], current) => [
                ...accumulator,
                ...current.transactions,
            ],
            [],
        );
    }

    isSubStatusFinal(status: SubscriptionStatus): boolean {
        return status === 'Canceled' || status === 'Expired';
    }

    async getUserSubscriptionById(customerId: string, subscriptionId: string): Promise<Subscription> {
        const customerSubs = await this.getUserSubscriptions(customerId);

        if (customerSubs.some(subscription => subscription.id === subscriptionId)) {
            return await this.gateway.subscription.find(subscriptionId);
        }

        return null;
    }

    async getUserActiveSubscriptions(customerId: string) {
        const subscriptions = await this.getUserSubscriptions(customerId);
        return subscriptions.filter(sub => !this.isSubStatusFinal(sub.status));
    }

    async isAlreadySubscribed(planId: string, customerId: string): Promise<boolean> {
        const customer = await this.getCustomerById(customerId);

        return customer.paymentMethods.some(
            cc => cc.subscriptions.some(
                sub => (sub.planId === planId && !this.isSubStatusFinal(sub.status))
            )
        );
    }

    async cancelUserSubscription(customerId: string, subscriptionId: string): Promise<boolean> {
        // Check if the user has that specific subscription to avoid deleting someone else's subscription
        const doesSubscriptionExist = (await this.gateway.customer.find(customerId))
            .paymentMethods.some(
                (payMethod) => payMethod.subscriptions.some(sub => (sub.id === subscriptionId)),
            );

        if (doesSubscriptionExist) {
            // Check if that subscription is in a non-final state
            const subscriptionStatus = (await this.gateway.subscription.find(subscriptionId)).status;
            const isSubscriptionActive = !this.isSubStatusFinal(subscriptionStatus);

            if (isSubscriptionActive) {
                await this.gateway.subscription.cancel(subscriptionId);
            }

            return true;
        }

        return false;
    };

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

    async test() {
    }
}

const braintree = new Braintree();

export default () => {
    braintree.init();
    return braintree;
};
