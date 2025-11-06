# Group analytics

export const viewGroupLight = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/view-groups-light-mode.png"
export const viewGroupDark = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/view-groups-dark-mode.png"
export const relatedLight = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/related-people-and-groups-light-mode.png"
export const relatedDark = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/related-people-and-groups-dark-mode.png"
export const groupInsightsLight = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/group-insights-light-mode.png"
export const groupInsightsDark = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/group-insights-dark-mode.png"
export const funnelsGroupAggregationLight = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/funnels-group-aggregation-light-mode.png"
export const funnelsGroupAggregationDark = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/funnels-group-aggregation-dark-mode.png"
export const groupsInFeatureLight = "https://res.cloudinary.com/dmukukwp6/video/upload/posthog.com/contents/images/docs/user-guides/group-analytics/groups-in-feature-flags-light-mode.mp4"
export const groupsInFeatureDark = "https://res.cloudinary.com/dmukukwp6/video/upload/posthog.com/contents/images/docs/user-guides/group-analytics/groups-in-feature-flags-dark-mode.mp4"
export const groupsProjectSettingLight = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/groups-project-settings-light-mode.png"
export const groupsProjectSettingDark = "https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/contents/images/docs/user-guides/group-analytics/groups-project-settings-dark-mode.png"

<iframe
    src="https://www.youtube-nocookie.com/embed/9mCWbVNzn4c"
    className="rounded shadow-xl"
/>

> 🎉 **New:** Group analytics is getting a makeover! Sign up for the [B2B analytics feature preview](https://app.posthog.com/settings/user-feature-previews#b2b-analytics) to get a sneak peek. [Let us know what you think in-app](https://us.posthog.com#panel=support%3Afeedback%3Acrm%3Alow).

**Groups** aggregate events based on entities, such as organizations or companies. They are especially useful for B2B customers and enable you to deploy feature flags, analyze insights, and run experiments at a group-level, as opposed to a user-level.

To clarify what we mean, let's look at a few examples:

1. For B2B SaaS apps, you can create a **company** group type. This enables you to aggregate events at a company-level, and calculate metrics such as `number of daily active companies`, `company churn rate`, or `how many companies have adopted a new feature`.

2. For a communication app like Slack, you can create a **channel** group type. This enables you to measure metrics like `average number of messages per channel`, `number of monthly active channels`, or `total number of channel participants`.

3. For collaborative, project-based apps like Notion, Jira, or Figma, you can create a **project** group type. This enables you to calculate metrics like `project pageviews`, `users per project`, and `project engagement`.

## Use cases

Building on the examples above, here are a few things you can do with groups:

1. Track how **companies** progress through your B2B product's activation steps. For example, you can create a [funnel](/docs/product-analytics/funnels) to see:
   - How many companies signed up this month.
   - What percentage completed the onboarding flow.
   - What percentage of new companies interacted with specific features at least once.

<br/>

2. If you're building a Slack-like app, you can measure [retention](/docs/product-analytics/retention) of new features by specific **channels**. For example:
   - Which channels consistently use the video calling feature.
   - How many channels remain active month over month.
   - Compare feature adoption rates between different types of channels (e.g., team channels vs project channels).

<br/>

3. For collaborative, project-based apps like Jira, you can target [feature flags](/docs/feature-flags) at a project-level. For example, let's say you've refactored your codebase. You can target the new codebase to only a few projects and measure the impact on performance and errors metrics. Once you've gathered feedback, you can expand to the rest of your projects.

Here's an overview to how groups can be applied across PostHog:

| Product  | Functionality | Example |
|----------|----------|----------|
| Product analytics | Aggregate trends, funnels, retention, and stickiness by group. | Create a funnel to track how many companies completed your onboarding flow. |
| Feature flags | Configure release conditions based on groups. | Ensure all users of a given company receive the same feature flag variant. |
| Experiments | Evaluate experiment results based on group aggregations. | Run an A/B test to improve activation rate for new companies. |
| Data warehouse | Join tables or enrich queries with groups data. | Write a custom SQL query that calculates product usage based across different company sizes. |

## The difference between groups and cohorts

Groups are often confused with [cohorts](/docs/data/cohorts), but they each serve different purposes:

- Groups aggregate events, and do not necessarily have to be connected to a user.
- Cohorts represent a specific set of users – e.g., a list of users that all belong to the same company.

If your only goal is to analyze a **list of users** with something in common, we recommend [cohorts](/docs/data/cohorts) instead of groups.

Groups require additional code in your app to set up, while cohorts are created in PostHog and don't require additional code. This makes cohorts easier to use and quicker to get started.

## How to create groups

Groups must be created before events can be associated with them.

<MultiLanguage>

```js-web
// Call posthog.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// web SDK, it also associates all subsequent events in the session
// with the group.
posthog.group('company', 'company_id_in_your_db');
// This event will be associated with the company above.
posthog.capture('user_signed_up');

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
posthog.capture('user_signed_up', {
    '$groups': {
        'company': 'company_id_in_your_db'
    }
});
```

```python
# Call posthog.group_identify() to create a group before capturing events.
# It sends a `$groupidentify` event to create or update the group.
# It will also create the group type if it doesn't exist.
posthog.group_identify('company', 'company_id_in_your_db')

# Once the group is created, you can associate events with it by
# passing the `group` argument. The `group` argument is required
# for every event that should be associated with the group.
posthog.capture(
    'user_signed_up',
    groups={'company': 'company_id_in_your_db'}
)
```

```go
// Call posthog.GroupIdentify{} to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist.
client.Enqueue(posthog.GroupIdentify{
    Type: "company",
    Key:  "company_id_in_your_db",
})

// Once the group is created, you can associate events with it by
// passing the `$groups` property. The `$groups` property is required
// for every event that should be associated with the group.
client.Enqueue(posthog.Capture{
    DistinctId: "user_distinct_id",
    Event: "user_signed_up",
    Groups: posthog.NewGroups().
        Set("company", "company_id_in_your_db"),
})
```

```node
// Call posthog.groupIdentify() to create a group before
// capturing events. It sends a `$groupidentify` event to create
// or update the group. It will also create the group type if it
// doesn't exist.
posthog.groupIdentify('company', 'company_id_in_your_db')

// Once the group is created, you can associate events with it by
// passing the `groups` property. The `groups` property is required
// for every event that should be associated with the group.
posthog.capture({
    event: 'user_signed_up',
    distinctId: 'user_distinct_id',
    groups: { company: 'company_id_in_your_db' }
})
```

```php
// Call PostHog::groupIdentify() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist.
PostHog::groupIdentify(array(
    'groupType' => 'company',
    'groupKey' => 'company_id_in_your_db'
));

// Once the group is created, you can associate events with it by
// passing the `$groups` property. The `$groups` property is required
// for every event that should be associated with the group.
PostHog::capture(array(
    'distinctId' => 'user_distinct_id',
    'event' => 'user_signed_up',
    '$groups' => array("company" => "company_id_in_your_db")
));
```

```ios_swift
// Call PostHogSDK.shared.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// iOS SDK, it also associates all subsequent events in the
// session with the group.
PostHogSDK.shared.group(type: "company", key: "company_id_in_your_db")
// This event will be associated with the company above.
PostHogSDK.shared.capture("user_signed_up")

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
PostHogSDK.shared.capture(
    event: "user_signed_up",
    properties: [
        "$groups": [
            "company": "company_id_in_your_db"
        ]
    ]
)
```

```android_kotlin
// Call PostHog.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// Android SDK, it also associates all subsequent events in the
// session with the group.
PostHog.group(type = "company", key = "company_id_in_your_db")
// This event will be associated with the company above.
PostHog.capture("user_signed_up")

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
PostHog.capture(
    event = "user_signed_up",
    properties = mapOf(
        "\$groups" to mapOf(
            "company" to "company_id_in_your_db"
        )
    )
)
```

```segment
// You'll always need to pass through the $groups object for Segment, even for analytics.js
analytics.track('user_signed_up', {
    $groups: { segment_group: 'company_id_in_your_db' }
})
```

```bash
# Call $groupidentify to create or update a group.
# It will also create the group type if it doesn't exist.
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "$groupidentify",
    "distinct_id": "static_string_used_for_all_group_events",
    "properties": {
        "$group_type": "company",
        "$group_key": "company_id_in_your_db"
    }
}' <ph_client_api_host>/i/v0/e/

# Once the group is created, you can associate events with it by
# passing the `$groups` property. The `$groups` property is required
# for every event that should be associated with the group.
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "user_signed_up",
    "distinct_id": "user_distinct_id",
    "properties": {
        "$groups": {"company": "company_id_in_your_db"}
    }
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage>

In the above example, we create a group type `company`. Then, for each company, we set the `group key` as the unique identifier for that specific company. This can be anything that helps you identify it, such as ID or domain.

We now have one `company`-type group with a key `company_id_in_your_db`. When we send the event `user_signed_up`, it will be attached to this newly created group.

> **Tips:**
> - When specifying the group type, use the singular version for clarity (`company` instead of `companies`).
> - We advise against using the _name_ of the company (or any other group) as the key, because that's rarely guaranteed to be unique, and thus can affect the quality of analytics data. Use a unique string, like an ID.

> **Group type limit:** There's a hard limit of 5 group types within PostHog, although within each group type you can have an unlimited number of groups.

## How to set group properties

In the same way that every person can have [properties](/docs/getting-started/person-properties) associated with them, every group can have properties associated with it.

Continuing with the previous example of using `company` as our group type, we'll add `company_name`, `date_joined`, and `subscription` as additional properties.

> **Note:** You must include at least one group property for a group to be visible in the [People and groups tab](https://app.posthog.com/persons).

<MultiLanguage>

```js-web
// Option 1 (recommended): Set properties in posthog.group()
// This has the side-effect that all subsequent events in the session are associated to the group
posthog.group('company', 'company_id_in_your_db', {
    name: 'PostHog',
    subscription: "subscription",
    date_joined: '2020-01-23'
});

// Option 2: 
// Set properties in posthog.capture()
// This method doesn't have the side-effect of associating all future events to the group.
posthog.capture('$groupidentify', {
    '$group_type': 'company',
    '$group_key': 'company_id_in_your_db',
    '$group_set': {
        name: 'PostHog',
        subscription: "subscription",
        date_joined: '2020-01-23'
    }
});
```

```python
posthog.group_identify('company', 'company_id_in_your_db', {
    'name': 'PostHog',
    'subscription': 'subscription',
    'date_joined': '2020-01-23'
})
```

```go
client.Enqueue(posthog.GroupIdentify{
    Type: "company",
    Key:  "company_id_in_your_db",
    Properties: posthog.NewProperties().
        Set("name", "PostHog").
        Set("subscription", "subscription").
        Set("date_joined", "2020-01-23"),
})
```

```node
posthog.groupIdentify({
    groupType: 'company',
    groupKey: 'company_id_in_your_db',
    properties: {
        name: 'PostHog',
        subscription: "subscription",
        date_joined: '2020-01-23'
    }
})
```

```php
PostHog::groupIdentify([
    'groupType' => 'company',
    'groupKey' => 'company_id_in_your_db',
    'properties' => ['name' => 'PostHog', 'subscription' => 'premium', 'date_joined' => '2020-01-23']
]);
```

```ios_swift
// Option 1 (recommended): Set properties in group()
// This has the side-effect that all subsequent events in the session are associated to the group
PostHogSDK.shared.group(
    type: "company", 
    key: "company_id_in_your_db",
    properties: [
        "name": "PostHog",
        "subscription": "subscription",
        "date_joined": "2020-01-23"
    ]
)

// Option 2: Set properties using capture
// This method doesn't have the side-effect of associating the session's events to the group
PostHogSDK.shared.capture(
    event: "$groupidentify",
    properties: [
        "$group_type": "company",
        "$group_key": "company_id_in_your_db",
        "$group_set": [
            "name": "PostHog",
            "subscription": "subscription",
            "date_joined": "2020-01-23"
        ]
    ]
)
```

```android_kotlin
// Option 1 (recommended): Set properties in group()
// This has the side-effect that all subsequent events in the session are associated to the group
PostHog.group(
    type = "company", 
    key = "company_id_in_your_db",
    properties = mapOf(
        "name" to "PostHog",
        "subscription" to "subscription",
        "date_joined" to "2020-01-23"
    )
)

// Option 2: Set properties using capture
// This method doesn't have the side-effect of associating the session's events to the group
PostHog.capture(
    event = "\$groupidentify",
    properties = mapOf(
        "\$group_type" to "company",
        "\$group_key" to "company_id_in_your_db",
        "\$group_set" to mapOf(
            "name" to "PostHog",
            "subscription" to "subscription",
            "date_joined" to "2020-01-23"
        )
    )
)
```

```segment
analytics.group('company_id_in_your_db', {
    "name": "PostHog",
    "subscription": "subscription",
    "date_joined": "2020-01-23"
})
```

```bash
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "$groupidentify",
    "properties": {
        "distinct_id": "company_id_in_your_db",
        "$group_type": "company",
        "$group_key": "company_id_in_your_db",
        "$group_set": {
            "name": "PostHog",
            "subscription": "premium",
            "date_joined": "2020-01-23"
        }
    }
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage>

Properties on groups behave in the same way as properties on [persons](/docs/data/persons). They can also be used within experiments and feature flags to rollout features to specific groups.

> **Note:** The PostHog UI identifies a group using the `name` property. If the `name` property is not found, it falls back to the group key.

## How to capture group events

How you capture events with groups depends whether you're using the JavaScript Web SDK or not. 

1. If you're using the JavaScript Web SDK (or snippet), you can call `posthog.group()`  and all of that **session's** events will be associated with that group.

2. If you're using any other SDK (or the API), you need to pass the group information in the `groups` parameter (or `$groups` property) for **every event you capture**.

Below are code examples of how to do it in our various SDKs.

<MultiLanguage>

```js-web
// Call posthog.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// web SDK, it also associates all subsequent events in the session
// with the group.
posthog.group('company', 'company_id_in_your_db');
// This event will be associated with the company above.
posthog.capture('user_signed_up');

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
posthog.capture('user_signed_up', {
    '$groups': {
        'company': 'company_id_in_your_db'
    }
});
```

```python
# Call posthog.group_identify() to create a group before capturing events.
# It sends a `$groupidentify` event to create or update the group.
# It will also create the group type if it doesn't exist.
posthog.group_identify('company', 'company_id_in_your_db')

# Once the group is created, you can associate events with it by
# passing the `group` argument. The `group` argument is required
# for every event that should be associated with the group.
posthog.capture(
    'user_signed_up',
    groups={'company': 'company_id_in_your_db'}
)
```

```go
// Call posthog.GroupIdentify{} to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist.
client.Enqueue(posthog.GroupIdentify{
    Type: "company",
    Key:  "company_id_in_your_db",
})

// Once the group is created, you can associate events with it by
// passing the `$groups` property. The `$groups` property is required
// for every event that should be associated with the group.
client.Enqueue(posthog.Capture{
    DistinctId: "user_distinct_id",
    Event: "user_signed_up",
    Groups: posthog.NewGroups().
        Set("company", "company_id_in_your_db"),
})
```

```node
// Call posthog.groupIdentify() to create a group before
// capturing events. It sends a `$groupidentify` event to create
// or update the group. It will also create the group type if it
// doesn't exist.
posthog.groupIdentify('company', 'company_id_in_your_db')

// Once the group is created, you can associate events with it by
// passing the `groups` property. The `groups` property is required
// for every event that should be associated with the group.
posthog.capture({
    event: 'user_signed_up',
    distinctId: 'user_distinct_id',
    groups: { company: 'company_id_in_your_db' }
})
```

```php
// Call PostHog::groupIdentify() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist.
PostHog::groupIdentify(array(
    'groupType' => 'company',
    'groupKey' => 'company_id_in_your_db'
));

// Once the group is created, you can associate events with it by
// passing the `$groups` property. The `$groups` property is required
// for every event that should be associated with the group.
PostHog::capture(array(
    'distinctId' => 'user_distinct_id',
    'event' => 'user_signed_up',
    '$groups' => array("company" => "company_id_in_your_db")
));
```

```ios_swift
// Call PostHogSDK.shared.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// iOS SDK, it also associates all subsequent events in the
// session with the group.
PostHogSDK.shared.group(type: "company", key: "company_id_in_your_db")
// This event will be associated with the company above.
PostHogSDK.shared.capture("user_signed_up")

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
PostHogSDK.shared.capture(
    event: "user_signed_up",
    properties: [
        "$groups": [
            "company": "company_id_in_your_db"
        ]
    ]
)
```

```android_kotlin
// Call PostHog.group() to create a group before capturing events.
// It sends a `$groupidentify` event to create or update the group.
// It will also create the group type if it doesn't exist. In the
// Android SDK, it also associates all subsequent events in the
// session with the group.
PostHog.group(type = "company", key = "company_id_in_your_db")
// This event will be associated with the company above.
PostHog.capture("user_signed_up")

// If the group type is already created, you can also manually add
// the `$groups` property to any event you want to associate with
// the group.
PostHog.capture(
    event = "user_signed_up",
    properties = mapOf(
        "\$groups" to mapOf(
            "company" to "company_id_in_your_db"
        )
    )
)
```

```segment
// You'll always need to pass through the $groups object for Segment, even for analytics.js
analytics.track('user_signed_up', {
    $groups: { segment_group: 'company_id_in_your_db' }
})
```

```bash
# Call $groupidentify to create or update a group.
# It will also create the group type if it doesn't exist.
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "$groupidentify",
    "distinct_id": "static_string_used_for_all_group_events",
    "properties": {
        "$group_type": "company",
        "$group_key": "company_id_in_your_db"
    }
}' <ph_client_api_host>/i/v0/e/

# Once the group is created, you can associate events with it by
# passing the `$groups` property. The `$groups` property is required
# for every event that should be associated with the group.
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "user_signed_up",
    "distinct_id": "user_distinct_id",
    "properties": {
        "$groups": {"company": "company_id_in_your_db"}
    }
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage>

> **Want to learn more about group analytics implementation differences?** Check out our [guide on frontend vs backend group analytics implementations](/tutorials/frontend-vs-backend-group-analytics).

Events must be [identified](/docs/data/anonymous-vs-identified-events) to be associated with a group. If the `$process_person_profile` event property ends up being set to `false`, the event will not be associated with the group.

It is **NOT** possible to assign a single event to two groups of the same type. However, it is possible to assign an event to multiple groups as long as the groups are of different types.

<MultiLanguage>

```js-web
// ❌ Not possible
posthog.group('company', 'company_id_in_your_db');
posthog.group('company', 'another_company_id_in_your_db');
posthog.capture('user_signed_up')

// ✅ Allowed
posthog.group('company', 'company_id_in_your_db');
posthog.group('channel', 'channel_id_in_your_db');
posthog.capture('user_signed_up')

```

```python
# ❌ Not possible
posthog.capture(
    'user_distinct_id',
    'user_signed_up',
    groups={
        'company': 'company_id_in_your_db',
        'company': 'another_company_id_in_your_db'
    }
)

# ✅ Allowed
posthog.capture(
    'user_distinct_id',
    'user_signed_up',
    groups={
        'company': 'company_id_in_your_db',
        'channel': 'channel_id_in_your_db'
    }
)
```

```go
// ❌ Not possible
client.Enqueue(posthog.Capture{
    DistinctId: "user_distinct_id",
    Event: "user_signed_up",
    Groups: posthog.NewGroups().
        Set("company", "company_id_in_your_db").
        Set("company", "another_company_id_in_your_db"),
})

// ✅ Allowed
client.Enqueue(posthog.Capture{
    DistinctId: "user_distinct_id",
    Event: "user_signed_up",
    Groups: posthog.NewGroups().
        Set("company", "company_id_in_your_db").
        Set("channel", "channel_id_in_your_db"),
```

```node
// ✅ Allowed
posthog.capture({
    event: 'user_signed_up',
    distinctId: 'user_distinct_id',
    groups: { 
        company: 'company_id_in_your_db',
        channel: 'channel_id_in_your_db'
    }
})
```

```php
// ❌ Not possible
PostHog::capture(array(
    'distinctId' => 'user_distinct_id',
    'event' => 'user_signed_up',
    '$groups' => array("company" => "company_id_in_your_db", "company" => "another_company_id_in_your_db")
));
// ✅ Allowed
PostHog::capture(array(
    'distinctId' => 'user_distinct_id',
    'event' => 'user_signed_up',
    '$groups' => array("company" => "company_id_in_your_db", "channel" => "channel_id_in_your_db")
));
```
</MultiLanguage>

### Advanced (server-side only): Capturing group events without a user

If you want to capture group events but don't want to associate them with a specific user, we recommend using a single static string as the distinct ID to capture these events. This can be anything you want, as long as it's the same for every group event:

<MultiLanguage >

```node
posthog.capture({
    event: 'group_event_name',
    distinctId: 'static_string_for_group_events',
    groups: { company: 'company_id_in_your_db' }
})
```

```python
posthog.capture('static_string_for_group_events', 
    'group_event_name', 
    groups={'company': 'company_id_in_your_db'}
)
```

```go
client.Enqueue(posthog.Capture{
    DistinctId: "static_string_for_group_events",
    Event: "group_event_name",
    Groups: posthog.NewGroups().
        Set("company", "company_id_in_your_db"),
})
```

```php
PostHog::capture(array(
    'distinctId' => 'static_string_for_group_events',
    'event' => 'group_event_name',
    '$groups' => array("company" => "company_id_in_your_db")
));
```

```bash
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "event": "group_event_name",
    "distinct_id": "static_string_for_group_events",
    "properties": {
        "$groups": {"company": "company_id_in_your_db"}
    }
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage >

## Using groups in PostHog

Now that we have created our first group type, we can take a look at how to use groups within PostHog.

### Viewing groups and their properties

To view groups and their properties, head to the **People and groups** tab on the navigation bar.

From here, you can select the group type you are interested in and view the groups and properties (by clicking the chevrons on the left). The properties shown here can be customized by clicking **Configure columns**.

<ProductScreenshot
    imageLight = "https://res.cloudinary.com/dmukukwp6/image/upload/Clean_Shot_2025_04_02_at_13_34_37_2x_0e700b3bb8.png" 
    imageDark = "https://res.cloudinary.com/dmukukwp6/image/upload/Clean_Shot_2025_04_02_at_13_34_49_2x_d92d58ce0d.png"
    classes="rounded"
    alt="View groups"
/>

Clicking one of groups brings you to the group details page. Here, you can generate, view, and customize a dashboard for the group. Beyond this, you can see events, recordings, related people, and more. On the **properties** tab, you can add, update, and delete group properties.

<ProductScreenshot
    imageLight = "https://res.cloudinary.com/dmukukwp6/image/upload/Clean_Shot_2025_04_02_at_13_27_14_2x_faa9770710.png" 
    imageDark = "https://res.cloudinary.com/dmukukwp6/image/upload/Clean_Shot_2025_04_02_at_13_26_02_2x_407c211ca9.png"
    classes="rounded"
    alt="View group details"
/>

### How to view group insights

You can use groups in [insights](/docs/product-analytics/insights) to view aggregated events based on group type.

For example, let's say that we wanted to see a graph showing how many different organizations have signed up recently:

To do this, expand the menu next to the event you've chosen. This lists of all the group types available. Next, select the option for "Unique" with your group type name, such as "Unique organizations." This shows a graph with the total number of groups (organizations) that have signed up (as opposed to individual users).

<ProductScreenshot
    imageLight = {groupInsightsLight} 
    imageDark = {groupInsightsDark}
    classes="rounded"
    alt="Analyze group insights"
/>

### Using groups with funnels

Another place where group analytics can be used is within funnels.

For example, you may want to understand how organizations move from their first visit to eventually signing up. You can do this by setting the "Aggregating by" field to "Unique organizations."

This shows how many organizations have made it through, as well as the percentage of organizations that dropped off. It's also possible to see exactly which specific groups dropped off at each step.

<ProductScreenshot
    imageLight = {funnelsGroupAggregationLight} 
    imageDark = {funnelsGroupAggregationDark}
    classes="rounded"
    alt="Group funnels"
/>

### Using groups with feature flags

Groups in feature flags enable you to rollout a feature by group type (like `company`), instead of users.

To do this, create a feature flag as you normally would, and select the group type you wish to "Match by", using the drop down in the "Release conditions" section:

<ProductVideo
    videoLight = {groupsInFeatureLight} 
    videoDark = {groupsInFeatureDark}
    classes="rounded"
    alt="Feature flags for groups"
/>

You also need to update your event tracking code for the feature flag to determine the groups of the current user.

<MultiLanguage>

```js-web
// Make sure you have called posthog.group() earlier in that session

if (posthog.isFeatureEnabled('new-groups-feature')) {
    // Do something
}
```

```python
if posthog.feature_enabled("new-groups-feature", "user_distinct_id", groups={"company": "company_id_in_your_db"}):
    # Do something
```

```php
if (PostHog::isFeatureEnabled('new-groups-feature', 'user_distinct_id', false, array("company" => "company_id_in_your_db"))) {
    // Do something
}
```

```node
const isFlagEnabled = await posthog.isFeatureEnabled('new-groups-feature', 'user_distinct_id', false, { company: 'company_id_in_your_db' })

if (isFlagEnabled) {
    // Toggle feature-flag specific behavior
}
```

</MultiLanguage>

### Renaming group types

You can change how group types are displayed in the insights interface and throughout PostHog by in project settings.

<ProductScreenshot
    imageLight = {groupsProjectSettingLight} 
    imageDark = {groupsProjectSettingDark}
    classes="rounded"
    alt="Groups in project settings"
/>

## Limitations

-   A maximum of 5 group types can be created per project.
-   Multiple groups of the same type cannot assigned to a single event (e.g., Company A & Company B).
-   Groups are not currently supported for the following insights:
    -   Lifecycle - Expected soon.
    -   User paths - These only support user level analytics.
-   Only groups with known properties are shown under [People and groups](https://us.posthog.com/persons) .
- Currently there is no functionality within the app to delete groups. If you need to delete a group for privacy or security reasons, please [use the support modal](https://app.posthog.com/home#supportModal=support%3Adata_management).

## Further reading

- [When and how to run group-targeted A/B tests](/blog/running-group-targeted-ab-tests)
