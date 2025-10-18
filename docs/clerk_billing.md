---
title: Clerk billing
description: Clerk billing is a feature that allows you to create and manage
  plans and features for your application.
lastUpdated: 2025-10-15T17:05:42.000Z
sdkScoped: "false"
canonical: /docs/guides/billing/overview
---

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

Clerk billing allows your customers to purchase recurring subscriptions to your application. To get started, **choose one or combine both of the following** business models depending on your application's needs.

<Cards>
  * [Billing for B2C SaaS](/docs/guides/billing/for-b2c)
  * To charge individual users

  ***

  * [Billing for B2B SaaS](/docs/guides/billing/for-b2b)
  * To charge companies or organizations

  ***

  * [Webhooks](/docs/guides/development/webhooks/billing)
  * To track subscription lifecycles and monitor payment attempts

  ***

  * [Build a simple checkout page](/docs/guides/development/custom-flows/billing/checkout-new-payment-method)
  * To charge users with a new payment method
</Cards>

## Frequently asked questions (FAQ)

### Can I use an existing Stripe account with Clerk billing?

Unfortunately, there is no way to use an existing business entity with Clerk billing.

### Can I see subscriptions in my Stripe account?

Clerk billing does not use Stripe products, prices, subscriptions, etc. Clerk manages plans and subscriptions/subscription items, and only uses Stripe for payment processing. You will still be able to see customer information, as well as payment information in your Stripe account.

### Is Clerk a Merchant of Record (MoR) for transactions?

No, Clerk does not provide this service.

### Does Clerk Billing support non-USD currencies?

Clerk Billing currently supports only USD as the billing currency. While you can connect both US and non-US Stripe accounts, all payments will be processed in USD regardless of your Stripe account’s local currency. For information about Stripe’s supported countries and currencies, see [Stripe Global](https://stripe.com/global){{ rel: 'noopener noreferrer' }}. Support for additional currencies is on our roadmap.

### What third-party tools does Clerk Billing integrate with?

None directly, but since payments are processed through Stripe, you can use any third-party tool that integrates with Stripe for analytics, reporting, invoicing, or tax compliance.

### Can I offer custom pricing plans to specific customers?

Clerk Billing does not currently support custom pricing plans, though we plan to roll out support for this in the future.

### Can I let users upgrade or downgrade their plans mid-cycle?

Yes. Plan upgrades will take effect immediately, while downgrades take effect at the end of the current billing cycle.

### Does Clerk Billing support annual subscriptions?

Yes, you can offer subscribers the option to pay annually, at a discounted monthly price. Set up annual pricing for your plans in the Clerk dashboard, and customers can choose between monthly or annual billing when subscribing.

### How does Clerk handle taxes and VAT for international billing?

Clerk Billing does not currently support tax or VAT, but these are planned for future releases.

### How can I test failure scenarios like expired cards or canceled subscriptions?

You can simulate failures in Stripe test mode using test cards that trigger specific behaviors. See [Stripe Testing](https://docs.stripe.com/testing){{ rel: 'noopener noreferrer' }} for a list of test cards and behaviors.

### Which countries is Clerk Billing not supported in?

Clerk Billing is not supported in Brazil, India, Malaysia, Mexico, Singapore, and Thailand due to [payment processing restrictions](https://stripe.com/legal/restricted-businesses). Support may be added in the future. For all other regions, availability depends on Stripe - see [Stripe Global](https://stripe.com/global){{ rel: 'noopener noreferrer' }} for the full list.


#### Clerk billing for B2C SaaS

---
title: Clerk billing for B2C SaaS
description: Clerk billing is a feature that allows you to create and manage
  plans and features for your application.
sdk: nextjs, react, expo, react-router, astro, tanstack-react-start, remix,
  nuxt, vue, js-frontend, expressjs, fastify, js-backend
sdkScoped: "true"
canonical: /docs/:sdk:/guides/billing/for-b2c
lastUpdated: 2025-10-15T17:48:27.000Z
availableSdks: nextjs,react,expo,react-router,astro,tanstack-react-start,remix,nuxt,vue,js-frontend,expressjs,fastify,js-backend
notAvailableSdks: chrome-extension,android,ios,go,ruby
activeSdk: nextjs
---

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

Clerk billing for B2C SaaS allows you to create plans and manage subscriptions **for individual users** in your application. If you'd like to charge companies or organizations, see <SDKLink href="/docs/:sdk:/guides/billing/for-b2b" sdks={["nextjs","react","expo","react-router","astro","tanstack-react-start","remix","nuxt","vue","js-frontend","expressjs","fastify","js-backend"]}>Billing for B2B SaaS</SDKLink>. You can also combine both B2C and B2B billing in the same application.

## Enable billing

To enable billing for your application, navigate to the [**Billing Settings**](https://dashboard.clerk.com/~/billing/settings) page in the Clerk Dashboard. This page will guide you through enabling billing for your application.

Clerk billing costs just 0.7% per transaction, plus Stripe's transaction fees which are paid directly to Stripe. Clerk Billing is **not** the same as Stripe Billing. Plans and pricing are managed directly through the Clerk Dashboard and won't sync with your existing Stripe products or plans. Clerk uses Stripe **only** for payment processing, so you don't need to set up Stripe Billing.

### Payment gateway

Once you have enabled billing, you will see the following **Payment gateway** options for collecting payments via Stripe:

* **Clerk development gateway**: A shared **test** Stripe account so developers can get started testing and building with billing **in development** without needing to create and configure a Stripe account.
* **Stripe account**: Use your own Stripe account.

## Create a plan

Subscription plans are what your users subscribe to. There is no limit to the number of plans you can create.

To create a plan, navigate to the [**Plans**](https://dashboard.clerk.com/~/billing/plans) page in the Clerk Dashboard. Here, you can create, edit, and delete plans. To setup B2C billing, select the **Plans for Users** tab and select **Add Plan**. When creating a plan, you can also create features for the plan; see the next section for more information.

> \[!TIP]
> What is the **Publicly available** option?
>
> ***
>
> Plans appear in some Clerk components depending on what kind of plan it is. All plans can appear in the `<PricingTable />` component. If it's a user plan, it can appear in the `<UserProfile />` component. When creating or editing a plan, if you'd like to hide it from appearing in Clerk components, you can toggle the **Publicly available** option off.

## Add features to a plan

[Features](/docs/guides/secure/features) make it easy to give entitlements to your plans. You can add any number of features to a plan.

You can add a feature to a plan when you are creating a plan. To add it after a plan is created:

1. Navigate to the [**Plans**](https://dashboard.clerk.com/~/billing/plans) page in the Clerk Dashboard.
2. Select the plan you'd like to add a feature to.
3. In the **Features** section, select **Add Feature**.

> \[!TIP]
> What is the **Publicly available** option?
>
> ***
>
> Plans appear in some Clerk components depending on what kind of plan it is. All plans can appear in the `<PricingTable />` component. If it's a user plan, it can appear in the `<UserProfile />` component. When adding a feature to a plan, it will also automatically appear in the corresponding plan. When creating or editing a feature, if you'd like to hide it from appearing in Clerk components, you can toggle the **Publicly available** option off.

## Create a pricing page

You can create a pricing page by using the <SDKLink href="/docs/:sdk:/reference/components/billing/pricing-table" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<PricingTable /></SDKLink> component. This component displays a table of plans and features that users can subscribe to. **It's recommended to create a dedicated page**, as shown in the following example.

<If sdk="nextjs">
  ```tsx {{ filename: 'app/pricing/page.tsx' }}
  import { PricingTable } from '@clerk/nextjs'

  export default function PricingPage() {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <PricingTable />
      </div>
    )
  }
  ```
</If>

## Control access with features and plans

You can use Clerk's features and plans to gate access to the content. There are a few ways to do this, but the recommended approach is to either use the <SDKLink href="/docs/reference/backend/types/auth-object#has" sdks={["js-backend"]} code={true}>has()</SDKLink> method or the <SDKLink href="/docs/:sdk:/reference/components/control/protect" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<Protect></SDKLink> component.

The `has()` method is available for any JavaScript framework, while `<Protect>` is only available for React-based frameworks.

### Example: Using `has()`

Use the `has()` method to test if the user has access to a **plan**:

```jsx
const hasPremiumAccess = has({ plan: 'gold' })
```

Or a **feature**:

```jsx
const hasPremiumAccess = has({ feature: 'widgets' })
```

The <SDKLink href="/docs/reference/backend/types/auth-object#has" sdks={["js-backend"]} code={true}>has()</SDKLink> method is a server-side helper that checks if the organization has been granted a specific type of access control (role, permission, feature, or plan) and returns a boolean value. `has()` is available on the <SDKLink href="/docs/reference/backend/types/auth-object" sdks={["js-backend"]} code={true}>auth object</SDKLink>, which you will access differently <SDKLink href="/docs/reference/backend/types/auth-object#how-to-access-the-auth-object" sdks={["js-backend"]}>depending on the framework you are using</SDKLink>.

<Tabs items={[ "Plan", "Feature"]}>
  <Tab>
    The following example demonstrates how to use `has()` to check if a user has a plan.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/bronze-content/page.tsx' }}
          import { auth } from '@clerk/nextjs/server'

          export default async function BronzeContentPage() {
            const { has } = await auth()

            const hasBronzePlan = has({ plan: 'bronze' })

            if (!hasBronzePlan) return <h1>Only subscribers to the Bronze plan can access this content.</h1>

            return <h1>For Bronze subscribers only</h1>
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `has()` to check if a user has a feature.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/premium-content/page.tsx' }}
          import { auth } from '@clerk/nextjs/server'

          export default async function PremiumContentPage() {
            const { has } = await auth()

            const hasPremiumAccess = has({ feature: 'premium_access' })

            if (!hasPremiumAccess)
              return <h1>Only subscribers with the Premium Access feature can access this content.</h1>

            return <h1>Our Exclusive Content</h1>
          }
          ```
        </If>
  </Tab>
</Tabs>

### Example: Using `<Protect>`

The <SDKLink href="/docs/:sdk:/reference/components/control/protect" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<Protect></SDKLink> component protects content or even entire routes by checking if the user has been granted a specific type of access control (role, permission, feature, or plan). You can pass a `fallback` prop to `<Protect>` that will be rendered if the user does not have the access control.

<Tabs items={["Plan", "Feature"]}>
  <Tab>
    The following example demonstrates how to use `<Protect>` to protect a page by checking if the user has a plan.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/protected-content/page.tsx' }}
          import { Protect } from '@clerk/nextjs'

          export default function ProtectedContentPage() {
            return (
              <Protect
                plan="bronze"
                fallback={<p>Only subscribers to the Bronze plan can access this content.</p>}
              >
                <h1>Exclusive Bronze Content</h1>
                <p>This content is only visible to Bronze subscribers.</p>
              </Protect>
            )
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `<Protect>` to protect a page by checking if the user has a feature.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/protected-premium-content/page.tsx' }}
          import { Protect } from '@clerk/nextjs'

          export default function ProtectedPremiumContentPage() {
            return (
              <Protect
                feature="premium_access"
                fallback={<p>Only subscribers with the Premium Access feature can access this content.</p>}
              >
                <h1>Exclusive Premium Content</h1>
                <p>This content is only visible to users with Premium Access feature.</p>
              </Protect>
            )
          }
          ```
        </If>
  </Tab>
</Tabs>


#### Clerk billing for B2B SaaS

---
title: Clerk billing for B2B SaaS
description: Clerk billing is a feature that allows you to create and manage
  plans and features for your application.
sdk: nextjs, react, expo, react-router, astro, tanstack-react-start, remix,
  nuxt, vue, js-frontend, expressjs, fastify, js-backend
sdkScoped: "true"
canonical: /docs/:sdk:/guides/billing/for-b2b
lastUpdated: 2025-10-15T17:48:27.000Z
availableSdks: nextjs,react,expo,react-router,astro,tanstack-react-start,remix,nuxt,vue,js-frontend,expressjs,fastify,js-backend
notAvailableSdks: chrome-extension,android,ios,go,ruby
activeSdk: nextjs
---

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

Clerk billing for B2B SaaS allows you to create plans and manage subscriptions **for companies or organizations** in your application. If you'd like to charge individual users, see <SDKLink href="/docs/:sdk:/guides/billing/for-b2c" sdks={["nextjs","react","expo","react-router","astro","tanstack-react-start","remix","nuxt","vue","js-frontend","expressjs","fastify","js-backend"]}>Billing for B2C SaaS</SDKLink>. You can also combine both B2C and B2B billing in the same application.

## Enable billing

To enable billing for your application, navigate to the [**Billing Settings**](https://dashboard.clerk.com/~/billing/settings) page in the Clerk Dashboard. This page will guide you through enabling billing for your application.

Clerk billing costs just 0.7% per transaction, plus Stripe's transaction fees which are paid directly to Stripe. Clerk Billing is **not** the same as Stripe Billing. Plans and pricing are managed directly through the Clerk Dashboard and won't sync with your existing Stripe products or plans. Clerk uses Stripe **only** for payment processing, so you don't need to set up Stripe Billing.

### Payment gateway

Once you have enabled billing, you will see the following **Payment gateway** options for collecting payments via Stripe:

* **Clerk development gateway**: A shared **test** Stripe account so developers can get started testing and building with billing **in development** without needing to create and configure a Stripe account.
* **Stripe account**: Use your own Stripe account.

## Create a plan

Subscription plans are what your customers subscribe to. There is no limit to the number of plans you can create. If your Clerk instance has existing [custom permissions](/docs/guides/organizations/roles-and-permissions), the corresponding features from those permissions will automatically be added to the free plan for orgs. This ensures that organization members get the same set of custom permissions when billing is enabled, because all organizations start on the free plan.

To create a plan, navigate to the [**Plans**](https://dashboard.clerk.com/~/billing/plans) page in the Clerk Dashboard. Here, you can create, edit, and delete plans. To setup B2B billing, select the **Plans for Organizations** tab and select **Add Plan**. When creating a plan, you can also create [features](/docs/guides/secure/features) for the plan; see the next section for more information.

> \[!TIP]
> What is the **Publicly available** option?
>
> ***
>
> Plans appear in some Clerk components depending on what kind of plan it is. All plans can appear in the `<PricingTable />` component. If it's an organization plan, it can appear in the `<OrganizationProfile />` component. When creating or editing a plan, if you'd like to hide it from appearing in Clerk components, you can toggle the **Publicly available** option off.

## Add features to a plan

[Features](/docs/guides/secure/features) make it easy to give entitlements to your plans. You can add any number of features to a plan.

You can add a feature to a plan when you are creating a plan. To add it after a plan is created:

1. Navigate to the [**Plans**](https://dashboard.clerk.com/~/billing/plans) page in the Clerk Dashboard.
2. Select the plan you'd like to add a feature to.
3. In the **Features** section, select **Add Feature**.

> \[!TIP]
> What is the **Publicly available** option?
>
> ***
>
> Plans appear in some Clerk components depending on what kind of plan it is. All plans can appear in the `<PricingTable />` component. If it's an organization plan, it can appear in the `<OrganizationProfile />` component. When adding a feature to a plan, it will also automatically appear in the corresponding plan. When creating or editing a feature, if you'd like to hide it from appearing in Clerk components, you can toggle the **Publicly available** option off.

## Create a pricing page

You can create a pricing page by using the <SDKLink href="/docs/:sdk:/reference/components/billing/pricing-table" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue","js-frontend"]} code={true}>\<PricingTable /></SDKLink> component. This component displays a table of plans and features that customers can subscribe to. **It's recommended to create a dedicated page**, as shown in the following example.

<If sdk="nextjs">
  ```tsx {{ filename: 'app/pricing/page.tsx' }}
  import { PricingTable } from '@clerk/nextjs'

  export default function PricingPage() {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <PricingTable forOrganizations />
      </div>
    )
  }
  ```
</If>

## Control access with features, plans, and permissions

You can use Clerk's features, plans, and permissions to gate access to content using <Tooltip><TooltipTrigger>authorization checks</TooltipTrigger><TooltipContent>Authorization checks are checks you perform in your code to determine the access rights and privileges of a user, ensuring they have the necessary permissions to perform specific actions or access certain content. Learn more about [authorization checks](/docs/guides/secure/authorization-checks).</TooltipContent></Tooltip>. There are a few ways to do this, but the recommended approach is to either use the <SDKLink href="/docs/reference/backend/types/auth-object#has" sdks={["js-backend"]} code={true}>has()</SDKLink> method or the <SDKLink href="/docs/:sdk:/reference/components/control/protect" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<Protect></SDKLink> component.

The `has()` method is available for any JavaScript-based framework, while `<Protect>` is a component, and therefore, is only available for React-based frameworks.

> \[!IMPORTANT]
> Permission-based authorization checks link with feature-based authorization checks. This means that if you are checking a custom permission, it will only work if the feature part of the permission key (`org:<feature>:<permission>`) **is a feature included in the organization's active plan**. For example, say you want to check if an organization member has the custom permission `org:teams:manage`, where `teams` is the feature. Before performing the authorization check, you need to ensure that the user's organization is subscribed to a plan that has the `teams` feature. If the user's organization is not subscribed to a plan that has the `teams` feature, the authorization check will always return `false`, *even if the user has the custom permission*.

### Example: Using `has()`

Use the `has()` method to test if the organization has access to a **plan**:

```jsx
const hasPremiumAccess = has({ plan: 'gold' })
```

Or a **feature**:

```jsx
const hasPremiumAccess = has({ feature: 'widgets' })
```

The <SDKLink href="/docs/reference/backend/types/auth-object#has" sdks={["js-backend"]} code={true}>has()</SDKLink> method is a server-side helper that checks if the organization has been granted a specific type of access control (role, permission, feature, or plan) and returns a boolean value. `has()` is available on the <SDKLink href="/docs/reference/backend/types/auth-object" sdks={["js-backend"]} code={true}>auth object</SDKLink>, which you will access differently <SDKLink href="/docs/reference/backend/types/auth-object#how-to-access-the-auth-object" sdks={["js-backend"]}>depending on the framework you are using</SDKLink>.

> \[!TIP]
> Why aren't custom permissions appearing in the session token (JWT) or in API responses (including the result of the `has()` check)?
>
> ***
>
> Custom permissions will only appear in the session token (JWT) and in API responses (including the result of the `has()` check) if the feature part of the permission key (`org:<feature>:<permission>`) **is a feature included in the organization's active plan**. If the feature is not part of the plan, the `has()` check for permissions using that feature will return `false`, and those permissions will not be represented in the session token.
>
> For example, say you want to check if an organization member has the custom permission `org:teams:manage`, where `teams` is the feature. The user's organization must be subscribed to a plan that has the `teams` feature for authorization checks to work. If the user's organization is not subscribed to a plan that has the `teams` feature, the authorization check will always return `false`, *even if the user has the custom permission*.

<Tabs items={[ "Plan", "Feature", "Permission"]}>
  <Tab>
    The following example demonstrates how to use `has()` to check if an organization has a plan.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/bronze-content/page.tsx' }}
          import { auth } from '@clerk/nextjs/server'

          export default async function BronzeContentPage() {
            const { has } = await auth()

            const hasBronzePlan = has({ plan: 'bronze' })

            if (!hasBronzePlan) return <h1>Only subscribers to the Bronze plan can access this content.</h1>

            return <h1>For Bronze subscribers only</h1>
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `has()` to check if an organization has a feature.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/premium-content/page.tsx' }}
          import { auth } from '@clerk/nextjs/server'

          export default async function PremiumContentPage() {
            const { has } = await auth()

            const hasPremiumAccess = has({ feature: 'premium_access' })

            if (!hasPremiumAccess)
              return <h1>Only subscribers with the Premium Access feature can access this content.</h1>

            return <h1>Our Exclusive Content</h1>
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `has()` to check if an organization has a permission.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/manage-premium-content/page.tsx' }}
          import { auth } from '@clerk/nextjs/server'

          export default async function ManagePremiumContentPage() {
            const { has } = await auth()

            const hasPremiumAccessManage = has({ permission: 'org:premium_access:manage' })

            if (!hasPremiumAccessManage)
              return (
                <h1>Only subscribers with the Premium Access Manage permission can access this content.</h1>
              )

            return <h1>Our Exclusive Content</h1>
          }
          ```
        </If>
  </Tab>
</Tabs>

### Example: Using `<Protect>`

The <SDKLink href="/docs/:sdk:/reference/components/control/protect" sdks={["astro","chrome-extension","expo","nextjs","nuxt","react","react-router","remix","tanstack-react-start","vue"]} code={true}>\<Protect></SDKLink> component protects content or even entire routes by checking if the organization has been granted a specific type of access control (role, permission, feature, or plan). You can pass a `fallback` prop to `<Protect>` that will be rendered if the organization does not have the access control.

<Tabs items={["Plan", "Feature", "Permission"]}>
  <Tab>
    The following example demonstrates how to use `<Protect>` to protect a page by checking if the organization has a plan.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/protected-content/page.tsx' }}
          import { Protect } from '@clerk/nextjs'

          export default function ProtectedContentPage() {
            return (
              <Protect
                plan="bronze"
                fallback={<p>Only subscribers to the Bronze plan can access this content.</p>}
              >
                <h1>Exclusive Bronze Content</h1>
                <p>This content is only visible to Bronze subscribers.</p>
              </Protect>
            )
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `<Protect>` to protect a page by checking if the organization has a feature.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/protected-premium-content/page.tsx' }}
          import { Protect } from '@clerk/nextjs'

          export default function ProtectedPremiumContentPage() {
            return (
              <Protect
                feature="premium_access"
                fallback={<p>Only subscribers with the Premium Access feature can access this content.</p>}
              >
                <h1>Exclusive Premium Content</h1>
                <p>This content is only visible to users with Premium Access feature.</p>
              </Protect>
            )
          }
          ```
        </If>
  </Tab>

  <Tab>
    The following example demonstrates how to use `<Protect>` to protect a page by checking if the organization has a permission.

        <If sdk="nextjs">
          ```tsx {{ filename: 'app/protected-manage-content/page.tsx' }}
          import { Protect } from '@clerk/nextjs'

          export default function ProtectedManageContentPage() {
            return (
              <Protect
                permission="premium_access:manage"
                fallback={
                  <p>Only subscribers with the Premium Access Manage permission can access this content.</p>
                }
              >
                <h1>Exclusive Management Content</h1>
                <p>This content is only visible to users with Premium Access Manage permission.</p>
              </Protect>
            )
          }
          ```
        </If>
  </Tab>
</Tabs>


#### Free trials

---
title: Free trials
description: Let users try paid features before subscribing
lastUpdated: 2025-10-15T17:48:27.000Z
sdkScoped: "false"
canonical: /docs/guides/billing/free-trials
---

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

Free trials let your users explore paid [features](/docs/guides/secure/features) for a limited time for free, helping them build confidence in a purchase decision. With Clerk Billing, you can turn on free trials for any plan, or set the same trial period across all your plans.

## Enable free trials

To enable free trials for your plans:

1. Navigate to the [**Plans**](https://dashboard.clerk.com/~/billing/plans) page in the Clerk Dashboard.
2. Select the plan you want to enable free trials on.
3. Enable **Free trial** and set the number of trial days (minimum is 1 day).

## What your users experience

### Starting a trial

Only users who have never paid for a subscription and have never used a free trial can start a free trial.

A credit card is required to start a free trial. This helps prevent abuse and ensures a smooth transition to paid service when the trial ends.

### During a trial

Users get access to the plan's paid features for the configured number of days. If they cancel during their trial, they keep access until the original trial end date.

### When the trial ends

If the user didn't cancel their subscription during the trial, they are charged using their default payment method on file. This may be a different payment method than the one used during checkout when the trial started.

If the user cancels their subscription during the trial, they lose access at the end of the trial and are moved back to the free plan. They are not charged.

Both you and your users will receive notifications when a trial is about to expire:

* You'll receive a `subscriptionItem.freeTrialEnding` webhook event 3 days before the trial expires.
* Users receive an email notification 3 days before their trial expires.

If the trial period is shorter than 3 days, these notifications are sent immediately when the trial begins.

## Manage trials

You can manually change the duration of a user's trial:

* **Cancel at the end of the trial**: Cancel the trial while allowing the user to keep access to the paid features until the trial period ends. This prevents their default payment method from being charged when the trial period ends.
* **End immediately**: Immediately move the user back to the free plan and terminate their access to the paid features they were trialing.
* **Extend a trial**: Make a user's trial last longer. You must extend a trial by at least 1 day and no more than 365 days.

You can only manage the trial of a user while the trial is active. Once a trial ends, you can no longer extend or cancel it.

To manage a trial for a subscription:

1. Navigate to the [**Subscriptions**](https://dashboard.clerk.com/~/billing/subscriptions) page in the Clerk Dashboard.
2. Select the subscription with the trial you want to manage.
3. Under **Subscriptions**, select the **...** menu to see the available actions for managing the trial.

#### Clerk billing webhooks

---
title: Clerk billing webhooks
description: Clerk billing webhooks allow you to track subscription lifecycles
  and monitor payment attempts.
sdk: nextjs, react, expo, react-router, astro, tanstack-react-start, remix,
  nuxt, vue, js-frontend, expressjs, fastify, js-backend
sdkScoped: "true"
canonical: /docs/:sdk:/guides/development/webhooks/billing
lastUpdated: 2025-10-15T17:48:27.000Z
availableSdks: nextjs,react,expo,react-router,astro,tanstack-react-start,remix,nuxt,vue,js-frontend,expressjs,fastify,js-backend
notAvailableSdks: chrome-extension,android,ios,go,ruby
activeSdk: nextjs
---

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

Clerk billing supports webhook events that allow you to track information like subscription lifecycles and payments.

## Subscriptions

A subscription is a top-level container unique to each user or organization. Subscription events can help you track billing changes for each of your customers.

| Event Name | Description |
| - | - |
| `subscription.created` | The top-level subscription is created. This usually happens when a user or organization is created. For existing users and organizations, a subscription will be created when billing is enabled for the application. |
| `subscription.updated` | The top-level subscription is updated. This event is triggered when any property of the subscription has changed, except for status changes. For example, when the subscription items for the payer change. |
| `subscription.active` | The top-level subscription transitions to active from a non-active status. This happens when any subscription item is set to active, including items from the free default plan. |
| `subscription.pastDue` | The top-level subscription contains a subscription item that has become past due. |

## Subscription items

A subscription item provides details about the relationship between the payer (user or organization) and a plan. A top-level subscription may contain multiple subscription items.

There can only be one `active` subscription item per payer and plan. In addition, the subscription item for the default plan will always have the same `id` to allow easier tracking of which users and organizations are not paid customers.

| Event Name | Description |
| - | - |
| `subscriptionItem.updated` | The subscription item is updated. This event is triggered when a property of the subscription item has changed that does not result in a status change. For example, when a subscription item is renewed and the recurring monthly charge succeeds, the status doesn't change (remains `active`), but `period_start` and `period_end` are updated. This results in a `subscriptionItem.updated` event. |
| `subscriptionItem.active` | The subscription item is set to active. For paid plans, this happens on successful payment. |
| `subscriptionItem.canceled` | The subscription item is canceled. The payer retains plan features until the end of the current billing period. |
| `subscriptionItem.upcoming` | The subscription item is set as upcoming after the current billing period. This can happen in the case of a deferred plan change from a higher-priced to lower-priced plan. In the case a paid plan is canceled, the subscription item for the default, free plan will be set as `upcoming`. |
| `subscriptionItem.ended` | The subscription item has ended. |
| `subscriptionItem.abandoned` | The subscription item is abandoned. This can happen to `upcoming` subscription items if the payer subscribes to another plan, or re-subscribes to a currently canceled plan. |
| `subscriptionItem.incomplete` | The subscription item is incomplete. This means the payer has started a checkout for a plan, but the payment hasn't been successfully processed yet. Once payment succeeds, the subscription item transitions to an `active` status. |
| `subscriptionItem.pastDue` | The subscription item is past due because a recurring charge has failed. |
| `subscriptionItem.freeTrialEnding` | The subscription item is a free trial and is ending soon. This event is sent three days before the trial ends. If the trial is shorter than three days, it's sent immediately. |

## Payment attempts

Payment attempts allow you to track successful and failed payments, for both checkout and recurring charges.

Payment attempt events contain a `type`, which can be either `checkout` or `recurring`. You can use these values to determine whether a payment attempt was for a checkout or a subscription item renewal's recurring charge.

| Event Name | Description |
| - | - |
| `paymentAttempt.created` | A payment attempt has been created with `pending` status. It can either succeed or fail in the future. |
| `paymentAttempt.updated` | A payment attempt has been updated to `paid` or `failed` status. |

Looking for other webhook events? To find a list of all the events Clerk supports, navigate to the [**Webhooks**](https://dashboard.clerk.com/~/webhooks) page and select the **Event Catalog** tab.

## Build a custom checkout flow with a new payment method

---
title: Build a custom checkout flow with a new payment method
description: Learn how to use the Clerk API to build a custom checkout flow that
  allows users to add a new payment method during checkout.
lastUpdated: 2025-10-15T17:48:27.000Z
sdkScoped: "false"
canonical: /docs/guides/development/custom-flows/billing/checkout-new-payment-method
---

> \[!WARNING]
> This guide is for users who want to build a *custom* user interface using the Clerk API. To use a *prebuilt* UI, use the [Account Portal pages](/docs/guides/customizing-clerk/account-portal) or <SDKLink href="/docs/:sdk:/reference/components/overview" sdks={["react","nextjs","js-frontend","chrome-extension","expo","android","expressjs","fastify","react-router","remix","tanstack-react-start","go","astro","nuxt","vue","ruby","js-backend","ios"]}>prebuilt components</SDKLink>.

> \[!WARNING]
>
> Billing is currently in Beta and its APIs are experimental and may undergo breaking changes. To mitigate potential disruptions, we recommend [pinning](/docs/pinning) your SDK and `clerk-js` package versions.

This guide will walk you through how to build a custom user interface for a checkout flow that allows users to **add a new payment method during checkout**.

For the custom flow that allows users to checkout **with an existing payment** method, see the [dedicated guide](/docs/guides/development/custom-flows/billing/checkout-existing-payment-method).

For the custom flow that allows users to add a new payment method to their account, **outside of a checkout flow**, see the [dedicated guide](/docs/guides/development/custom-flows/billing/add-new-payment-method).

<Steps>
  ## Enable billing features

  To use billing features, you first need to ensure they are enabled for your application. Follow the [Billing documentation](/docs/guides/billing/overview) to enable them and setup your plans.

  ## Checkout flow

  To create a checkout session with a new payment card, you must:

  1. Set up the checkout provider with plan details.
  2. Initialize the checkout session when the user is ready.
  3. Render the payment form for card collection.
  4. Confirm the payment with the collected payment method.
  5. Complete the checkout process and redirect the user.

  <Tabs items={["Next.js"]}>
    <Tab>
      The following example:

      1. Uses the <SDKLink href="/docs/:sdk:/reference/hooks/use-checkout" sdks={["nextjs","react"]} code={true}>useCheckout()</SDKLink> hook to get to initiate and manage the checkout session.
      2. Uses the <SDKLink href="/docs/:sdk:/reference/hooks/use-payment-element" sdks={["nextjs","react"]} code={true}>usePaymentElement()</SDKLink> hook to control the payment element, which is rendered by `<PaymentElement />`.
      3. Assumes that you have already have a valid `planId`, which you can acquire in many ways.
         * [Copy from the Clerk Dashboard](https://dashboard.clerk.com/~/billing/plans?tab=user).
         * Use the [Clerk Backend API](/docs/reference/backend-api/tag/commerce/get/commerce/plans#tag/commerce/get/commerce/plans).
         * Use the new <SDKLink href="/docs/:sdk:/reference/hooks/use-plans" sdks={["nextjs","react"]} code={true}>usePlans()</SDKLink> hook to get the plan details.

      This example is written for Next.js App Router but can be adapted for any React-based framework.

      ```tsx {{ filename: 'app/checkout/page.tsx' }}
      'use client'
      import * as React from 'react'
      import { SignedIn, ClerkLoaded } from '@clerk/nextjs'
      import {
        CheckoutProvider,
        useCheckout,
        PaymentElementProvider,
        PaymentElement,
        usePaymentElement,
      } from '@clerk/nextjs/experimental'

      export default function CheckoutPage() {
        return (
          <CheckoutProvider for="user" planId="cplan_xxx" planPeriod="month">
            <ClerkLoaded>
              <SignedIn>
                <CustomCheckout />
              </SignedIn>
            </ClerkLoaded>
          </CheckoutProvider>
        )
      }

      function CustomCheckout() {
        const { checkout } = useCheckout()
        const { status } = checkout

        if (status === 'needs_initialization') {
          return <CheckoutInitialization />
        }

        return (
          <div className="checkout-container">
            <CheckoutSummary />

            <PaymentElementProvider checkout={checkout}>
              <PaymentSection />
            </PaymentElementProvider>
          </div>
        )
      }

      function CheckoutInitialization() {
        const { checkout } = useCheckout()
        const { start, status, fetchStatus } = checkout

        if (status !== 'needs_initialization') {
          return null
        }

        return (
          <button onClick={start} disabled={fetchStatus === 'fetching'} className="start-checkout-button">
            {fetchStatus === 'fetching' ? 'Initializing...' : 'Start Checkout'}
          </button>
        )
      }

      function PaymentSection() {
        const { checkout } = useCheckout()
        const { isConfirming, confirm, finalize, error } = checkout

        const { isFormReady, submit } = usePaymentElement()
        const [isProcessing, setIsProcessing] = React.useState(false)

        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          if (!isFormReady || isProcessing) return
          setIsProcessing(true)

          try {
            // Submit payment form to get payment method
            const { data, error } = await submit()
            // Usually a validation error from stripe that you can ignore
            if (error) {
              return
            }
            // Confirm checkout with payment method
            await confirm(data)
            // Complete checkout and redirect
            finalize({ redirectUrl: '/dashboard' })
          } catch (error) {
            console.error('Payment failed:', error)
          } finally {
            setIsProcessing(false)
          }
        }

        return (
          <form onSubmit={handleSubmit}>
            <PaymentElement fallback={<div>Loading payment element...</div>} />

            {error && <div>{error.message}</div>}

            <button type="submit" disabled={!isFormReady || isProcessing || isConfirming}>
              {isProcessing || isConfirming ? 'Processing...' : 'Complete Purchase'}
            </button>
          </form>
        )
      }

      function CheckoutSummary() {
        const { checkout } = useCheckout()
        const { plan, totals } = checkout

        if (!plan) {
          return null
        }

        return (
          <div>
            <h2>Order Summary</h2>
            <span>{plan.name}</span>
            <span>
              {totals.totalDueNow.currencySymbol} {totals.totalDueNow.amountFormatted}
            </span>
          </div>
        )
      }
      ```
    </Tab>
  </Tabs>
</Steps>


