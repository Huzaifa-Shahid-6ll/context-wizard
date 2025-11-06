# Cutting product analytics costs

We aim to be significantly cheaper than our competitors. In addition to our [pay-as-you-go pricing](/pricing), below are tips to reduce your product analytics costs:

## Creating a billable usage dashboard

Want to know exactly what's driving your bill? Create a dashboard with the [PostHog billable usage template](/templates/posthog-billable-usage) to break down and analyze your usage across different events, SDK libraries, and products.

<ProductScreenshot
    imageLight="https://res.cloudinary.com/dmukukwp6/image/upload/posthog_billable_usage_b2b494d4bb.png"
    imageDark="https://res.cloudinary.com/dmukukwp6/image/upload/posthog_billable_usage_b2b494d4bb.png"
    alt="PostHog billable usage dashboard"
    classes="max-w-md mx-auto rounded"
/>

This dashboard turns your billing usage into a live, interactive report — so you can create insights, spot spikes, and optimize how you're spending.

## Use anonymous events

PostHog captures two types of events: [**anonymous** and **identified**](/docs/data/anonymous-vs-identified-events). Under our current [pricing](/pricing), anonymous events can be up to 4x cheaper than identified ones (due to the cost of processing them), so it's recommended you only capture identified events when needed.

See our docs on [anonymous vs identified events](/docs/data/anonymous-vs-identified-events) for more information on the differences between them and how to capture them.

## Configure autocapture

[Autocapture](/docs/product-analytics/autocapture) is a powerful feature that captures many events automatically. It can also capture more than you need. To reduce which events are captured, you can [set an allow or ignore list](/docs/product-analytics/autocapture#reducing-events-with-an-allow-and-ignorelist).

Alternatively, you can [disable autocapture](/docs/product-analytics/autocapture#disabling-autocapture) completely.

## Only call `identify()` once per session

It's only necessary to [identify](/docs/product-analytics/identify) a user once per session. To prevent sending unnecessary events, check `posthog._isIdentified()` before calling `identify()`:

```js
if (!posthog._isIdentified()) {
    posthog.identify('distinct_id') // Replace 'distinct_id' with your user's unique identifier
}
```

## Only call `group()` once per session

In client-side SDKs, it's only necessary to call [`group()`](/docs/product-analytics/group-analytics) once per session. Prevent calling it multiple times to send fewer events and reduce costs.

To see where duplicate `$groupidentify` events are being generated, you can use the following SQL:

```
SELECT properties.$lib AS lib, count() AS groupidentify_event_count
FROM events
WHERE event = '$groupidentify'
  AND $session_id IN (
    SELECT $session_id
    FROM events
    WHERE event = '$groupidentify'
      ```
SELECT properties.$lib AS lib, count() AS groupidentify_event_count
FROM events
WHERE event = '$groupidentify'
  AND $session_id IN (
    SELECT $session_id
    FROM events
    WHERE event = '$groupidentify'
      AND timestamp &gt;= now() - INTERVAL 30 DAY
      AND timestamp &lt; now()
    GROUP BY $session_id
    HAVING count() &gt; 1
  )
GROUP BY lib
ORDER BY groupidentify_event_count DESC
    GROUP BY $session_id
    HAVING count() > 1
  )
  AND timestamp >= now() - INTERVAL 30 DAY
  AND timestamp < now()
GROUP BY lib
ORDER BY groupidentify_event_count DESC
```

## Disable pageview or pageleave events

PostHog automatically captures pageviews and pageleaves. This is great for analytics, but it may capture more events than you need. An alternative is disabling these events and capturing them manually for the pages you need instead.

To disable automatically capturing these events, set `capture_pageview` and `capture_pageleave` to `false` in the configuration options when initializing PostHog:

```js
  posthog.init('<ph_project_api_key>', {
    api_host: '<ph_client_api_host>',
    defaults: '<ph_posthog_js_defaults>',
    capture_pageview: false,
    capture_pageleave: false,
  })
```

To manually capture these events, call `posthog.capture('$pageview')` and `posthog.capture('$pageleave')`.

> **Note:** Disabling pageview and pageleave events may prevent other PostHog features from working, like [bounce rate](/docs/data/events#how-events-power-posthog).
