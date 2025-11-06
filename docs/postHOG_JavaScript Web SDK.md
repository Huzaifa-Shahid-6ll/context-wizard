# JavaScript web

> **Note:** This doc refers to our [posthog-js](https://github.com/PostHog/posthog-js) library for use on the browser. For server-side JavaScript, see our [Node SDK](/docs/libraries/node).

## Installation

### Option 1: Add the JavaScript snippet to your HTML <span class="bg-accent text-gray font-semibold align-middle text-sm p-1 rounded">Recommended</span>

This is the simplest way to get PostHog up and running. It only takes a few minutes.

Copy the snippet below and replace `<ph_project_api_key>` and `<ph_client_api_host>` with your project's values, then add it within the `<head>` tags at the base of your product - ideally just before the closing `</head>` tag. This ensures PostHog loads on any page users visit.

You can find the snippet pre-filled with this data in [your project settings](https://us.posthog.com/settings/project#snippet).

```html
<script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('<ph_project_api_key>',{api_host:'<ph_client_api_host>', defaults:'<ph_posthog_js_defaults>'})
</script>
```

Once the snippet is added, PostHog automatically captures `$pageview` and [other events](/docs/data/autocapture) like button clicks. You can then enable other products, such as session replays, within [your project settings](https://us.posthog.com/settings). 

<br />

<details>
  <summary>Set up a reverse proxy (recommended)</summary>

We recommend [setting up a reverse proxy](/docs/advanced/proxy), so that events are less likely to be intercepted by tracking blockers.

We have our [own managed reverse proxy service included in the platform packages](/docs/advanced/proxy/managed-reverse-proxy), which routes through our infrastructure and makes setting up your proxy easy.

If you don't want to use our managed service then there are several other options for creating a reverse proxy, including using [Cloudflare](/docs/advanced/proxy/cloudflare), [AWS Cloudfront](/docs/advanced/proxy/cloudfront), and [Vercel](/docs/advanced/proxy/vercel).

</details>

<details>
  <summary>Grouping products in one project (recommended)</summary>

  If you have multiple customer-facing products (e.g. a marketing website + mobile app + web app), it's best to install PostHog on them all and [group them in one project](/docs/settings/projects). 
  
  This makes it possible to track users across their entire journey (e.g. from visiting your marketing website to signing up for your product), or how they use your product across multiple platforms.
</details>

<details>
  <summary>Include ES5 support (optional)</summary>

  If you need ES5 support for example to track Internet Explorer 11 replace `/static/array.js` in the snippet with `/static/array.full.es5.js`
</details>

<details>
  <summary>Working with AI code editors?</summary>

  If you’re working with AI code editors (like Lovable, Bolt.new, Replit, and others), it’s easy to install PostHog. Just give it this prompt: `npx -y @posthog/wizard@latest`

</details>

### Option 2: Install via package manager

<MultiLanguage>

```bash file=npm
npm install --save posthog-js
```

```bash file=Yarn
yarn add posthog-js
```

```bash file=pnpm
pnpm add posthog-js
```

```bash file=Bun
bun add posthog-js
```

</MultiLanguage>

And then include it with your project API key and host (which you can find in [your project settings](https://us.posthog.com/settings/project)):

```js-web
import posthog from 'posthog-js'

posthog.init('<ph_project_api_key>', {
  api_host: '<ph_client_api_host>',
  defaults: '<ph_posthog_js_defaults>'
})
```

See our framework specific docs for [Next.js](/docs/libraries/next-js), [React](/docs/libraries/react), [Vue](/docs/libraries/vue-js), [Angular](/docs/libraries/angular), [Astro](/docs/libraries/astro), [Remix](/docs/libraries/remix), and [Svelte](/docs/libraries/svelte) for more installation details.

<details>
<summary>Bundle all required extensions (advanced)</summary>

By default, the JavaScript Web library only loads the core functionality. It lazy-loads extensions such as surveys or the session replay 'recorder' when needed. 

This can cause issues if:

- You have a Content Security Policy (CSP) that blocks inline scripts. 
- You want to optimize your bundle at build time to ensure all dependencies are ready immediately.
- Your app is running in environments like the Chrome Extension store or [Electron](/tutorials/electron-analytics) that reject or block remote code loading.

To solve these issues, we have multiple import options available below.

**Note:** With any of the `no-external` options, the toolbar will be unavailable as this is only possible as a runtime dependency loaded directly from `us.posthog.com`.

```js-web
// No external code loading possible (this disables all extensions such as Replay, Surveys, Exceptions etc.)
import posthog from 'posthog-js/dist/module.no-external'

// No external code loading possible but all external dependencies pre-bundled
import posthog from 'posthog-js/dist/module.full.no-external'

// All external dependencies pre-bundled and with the ability to load external scripts (primarily useful is you use Site Apps)
import posthog from 'posthog-js/dist/module.full'

// Finally you can also import specific extra dependencies 
import "posthog-js/dist/recorder"
import "posthog-js/dist/surveys"
import "posthog-js/dist/exception-autocapture"
import "posthog-js/dist/tracing-headers"
import "posthog-js/dist/web-vitals"
import posthog from 'posthog-js/dist/module.no-external'

// All other posthog commands are the same as usual
posthog.init('<ph_project_api_key>', { api_host: '<ph_client_api_host>', defaults: '<ph_posthog_js_defaults>' })
```

**Note:** You should ensure if using this option that you always import `posthog-js` from the same module, otherwise multiple bundles could get included. At this time `@posthog/react` does not work with any module import other than the default.

</details>

<details>
<summary>Don't want to send test data while developing?</summary>

If you don't want to send test data while you're developing, you can do the following:

```js-web
if (!window.location.host.includes('127.0.0.1') && !window.location.host.includes('localhost')) {
    posthog.init('<ph_project_api_key>', { api_host: '<ph_client_api_host>', defaults: '<ph_posthog_js_defaults>' })
}
```

</details>
<details>
<summary>What is the `defaults` option?</summary>

The `defaults` is a date, such as `2025-05-24`, for a configuration snapshot used as defaults to initialize PostHog. This default is overridden when you explicitly set a value for any of the options.

</details>

Once you've installed PostHog, see our [features doc](/docs/libraries/js/features) for more information about what you can do with it.

### Track across marketing website &amp; app

We recommend putting PostHog both on your homepage and your application if applicable. That means you'll be able to follow a user from the moment they come onto your website, all the way through signup and actually using your product.

> PostHog automatically sets a cross-domain cookie, so if your website is `yourapp.com` and your app is on `app.yourapp.com` users will be followed when they go from one to the other. See our tutorial on [cross-website tracking](/tutorials/cross-domain-tracking) if you need to track users across different domains.

### Replay triggers

You can configure "replay triggers" in your [project settings](https://app.posthog.com/project/settings). You can configure triggers to enable or pause session recording when the user visit a page that matches the URL(s) you configure.

You are also able to setup "event triggers". Session recording will be started immediately before PostHog queues any of these events to be sent to the backend.

## Opt out of data capture

You can completely opt-out users from data capture. To do this, there are two options:

1. Opt users out by default by setting `opt_out_capturing_by_default` to `true` in your [PostHog config](/docs/libraries/js/config).

```js-web
posthog.init('<ph_project_api_key>', {
    opt_out_capturing_by_default: true,
});
```

2. Opt users out on a per-person basis by calling `posthog.opt_out_capturing()`.

Similarly, you can opt users in:

```js-web
posthog.opt_in_capturing()
```

To check if a user is opted out:

```js-web
posthog.has_opted_out_capturing()
```

## Running more than one instance of PostHog at the same time

While not a first-class citizen, PostHog allows you to run more than one instance of PostHog at the same time if you, for example, want to track different events in different posthog instances/projects.

`posthog.init` accepts a third parameter that can be used to create named instances.

```ts
posthog.init('<ph_project_api_key>', {}, 'project1')
posthog.init('<ph_project_api_key>', {}, 'project2')
```

You can then call these different instances by accessing it on the global `posthog` object

```ts
posthog.project1.capture('some_event')
posthog.project2.capture('other_event')
```

> **Note:** You'll probably want to disable autocapture (and some other events) to avoid them from being sent to both instances. Check all of our [config options](/docs/libraries/js/config) to better understand that.

## Debugging

To see all the data that is being sent to PostHog, you can run `posthog.debug()` in your dev console or set the `debug` option to `true` in the `init` call. You can also enable debug mode by appending this query to the URL `?__posthog_debug=true` (i.e., https://posthog.com/?__posthog_debug=true).

### Exposing the `posthog` global object in web apps that don't have `window.posthog`

> This has been tested in Chrome and Firefox. Safari doesn't have this feature, but other Chromium and Gecko/Firefox browsers do.

Sometimes you may want to test PostHog in the browser by using `posthog.capture()` or some other method. Although some sites expose `window.posthog`, most modern web app (React, Vue, etc.) don't.

To expose PostHog in the browser:

1. Enable debug mode by setting `debug: true` in your config
2. In the browser console, search for `[PostHog.js] Starting in debug mode`
3. Expand the object
4. Right-click on `this` and pick "Store as global variable"

You can then access `posthog` as `temp0` in Firefox and `temp1` in Chrome. You can then do stuff like `temp1.capture('test event')`.

## Development

For instructions on how to run `posthog-js` locally and setup your development environment, please checkout the README on the [posthog-js](https://github.com/PostHog/posthog-js#README) repository.


# JavaScript web usage

## Capturing events

By default, PostHog automatically captures pageviews and pageleaves as well as clicks, change of inputs, and form submissions associated with `a`, `button`, `form`, `input`, `select`, `textarea`, and `label` tags. See our [autocapture docs](/docs/product-analytics/autocapture) for more details on this.

If you prefer to disable or filter these, set the appropriate values in your [configuration options](/docs/libraries/js/config).

### Custom event capture

You can send custom events using `capture`:

```js-web
posthog.capture('user_signed_up');
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```js-web
posthog.capture('user_signed_up', {
    login_type: "email",
    is_free_trial: true
})
```

## Anonymous and identified events

PostHog captures two types of events: [**anonymous** and **identified**](/docs/data/anonymous-vs-identified-events)

**Identified events** enable you to attribute events to specific users, and attach [person properties](/docs/product-analytics/person-properties). They're best suited for logged-in users.

Scenarios where you want to capture identified events are:

- Tracking logged-in users in B2B and B2C SaaS apps
- Doing user segmented product analysis
- Growth and marketing teams wanting to analyze the _complete_ conversion lifecycle
   
**Anonymous events** are events without individually identifiable data. They're best suited for [web analytics](/docs/web-analytics) or apps where users aren't logged in. 

Scenarios where you want to capture anonymous events are:

- Tracking a marketing website
- Content-focused sites
- B2C apps where users don't sign up or log in

Under the hood, the key difference between identified and anonymous events is that for identified events we create a [person profile](/docs/data/persons) for the user, whereas for anonymous events we do not.

 > **Important:** Due to the reduced cost of processing them, anonymous events can be up to 4x cheaper than identified ones, so we recommended you only capture identified events when needed.

### Capturing anonymous events

The JavaScript Web SDK captures anonymous events by default. However, this may change depending on your [`person_profiles` config](/docs/libraries/js/config) when initializing PostHog:

1. `person_profiles: 'identified_only'` _(recommended)_ _(default)_ - Anonymous events are captured by default. PostHog only captures identified events for users where [person profiles](/docs/data/persons) have already been created. 

2. `person_profiles: 'always'`  - Capture identified events for all events.

For example:

```js-web
posthog.init('<ph_project_api_key>', {
    api_host: '<ph_client_api_host>',
    defaults: '<ph_posthog_js_defaults>',
    person_profiles: 'always'
})
```

### Capturing identified events

If you've set the [`personProfiles` config](/docs/libraries/js/config) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. To capture identified events, call any of the following functions:

- [`identify()`](/docs/product-analytics/identify)
- [`alias()`](/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](/docs/product-analytics/group-analytics)
- [`setPersonProperties()`](/docs/product-analytics/person-properties)
- [`setPersonPropertiesForFlags()`](/docs/libraries/js/features#overriding-server-properties)
- [`setGroupPropertiesForFlags()`](/docs/libraries/js/features#overriding-server-properties)

When you call any of these functions, it creates a [person profile](/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.

#### Identifying users

The most useful of these methods is `identify`. We strongly recommend reading our doc on [identifying users](/docs/product-analytics/identify) to better understand how to correctly use it.

Using `identify`, you can capture identified events associated with specific users. This enables you to understand how they're using your product across different sessions, devices, and platforms.

```js-web
posthog.identify(
    'distinct_id', // Required. Replace 'distinct_id' with your user's unique identifier
    { email: 'max@hedgehogmail.com', name: 'Max Hedgehog' },  // $set, optional
    { first_visited_url: '/blog' } // $set_once, optional
);
```

Calling `identify` creates a person profile if one doesn't exist already. This means all events for that distinct ID count as identified events.

You can get the distinct ID of the current user by calling `posthog.get_distinct_id()`.

## Setting person properties

To set [person properties](/docs/data/user-properties) in these profiles, include them when capturing an event:

```js-web
posthog.capture(
  'event_name',
  {
    $set: { name: 'Max Hedgehog'  },
    $set_once: { initial_url: '/blog' },
  }
)
```

Typically, person properties are set when an event occurs like `user updated email` but there may be occasions where you want to set person properties as its own event.

```js
posthog.setPersonProperties(
  { name: "Max Hedgehog" }, // These properties are like the `$set` from above
  { initial_url: "/blog" }  // These properties are like the `$set_once` from above
)
```

This creates a special `$set` event that is sent to PostHog. For more details on the difference between `$set` and `$set_once`, see our [person properties docs](/docs/data/user-properties#what-is-the-difference-between-set-and-set_once).

## Resetting a user

If a user logs out or switches accounts, you should call `reset` to unlink any future events made on that device with that user. This prevents multiple users from being grouped together due to shared cookies between sessions. **We recommend you call `reset` on logout even if you don't expect users to share a computer.**

You can do that like so:

```js-web
posthog.reset()
```

If you _also_ want to reset `device_id`, you can pass `true` as a parameter:

```js-web
posthog.reset(true)
```

This also resets group analytics.

## Alias

Sometimes, you want to assign multiple distinct IDs to a single user. This is helpful when your primary distinct ID is inaccessible. For example, if a distinct ID used on the frontend is not available in your backend.

In this case, you can use `alias` to assign another distinct ID to the same user.

```js-web
posthog.alias('alias_id', 'distinct_id');
```

We recommend reading our docs on [alias](/docs/data/identify#alias-assigning-multiple-distinct-ids-to-the-same-user) to best understand how to correctly use this method.

## Group analytics

[Group analytics](/docs/product-analytics/group-analytics) enables you to associate the events for that person's session with a group (e.g. teams, organizations, etc.).

> **Note:** This is a paid feature and is not available on the open-source or free cloud plan. Learn more [here](/pricing).

This is done by calling the `group` method with a group type and group ID.

```js-web
posthog.group('company', 'company_id_in_your_db')

posthog.capture('upgraded_plan') // this event is associated with company ID `company_id_in_your_db`
```

You can also set group properties by passing a third argument to the `group` method.

```js-web
posthog.group('company', 'company_id_in_your_db', {
    name: 'Awesome Inc.',
    employees: 11,
})
```

The `name` is a special property used in the PostHog UI for the name of the group. If you don't specify a `name` property, the group ID is used instead.

## Super properties

Super properties are properties associated with events that are set once and then sent with every `capture` call across sessions, be it a `$pageview`, an autocaptured button click, or anything else.

They are set using `posthog.register`, which takes a properties object as a parameter like this:

```js-web
posthog.register({
    'icecream_pref': 'vanilla',
})
```

The call above ensures that every event sent includes a `"icecream pref": "vanilla"` property. This way, if you filtered events by property using `icecream_pref = vanilla`, it would display all events captured on that user after the `posthog.register` call, since they all include the specified super property.

This does **not** set a person or group property. It only sets the properties on events.

Furthermore, if you register the same property multiple times, the next event will use the new value of that property. If you want to register a property only once (e.g. for ad campaign properties), you can use `register_once`, like so:

```js-web
posthog.register_once({
    'campaign_source': 'twitter',
})
```

Using `register_once` ensures that if a property is already set, it is not set again. For example, if the user already has property `"icecream_pref": "vanilla"`, calling `posthog.register_once({"icecream_pref": "chocolate"})` will **not** update the property.

### Removing stored super properties

Setting super properties creates a cookie on the client with the respective properties and their values. To stop sending a super property with events and remove the cookie, you can use `posthog.unregister`, like so:

```js-web
posthog.unregister('icecream_pref')
```

This removes the super property and subsequent events will not include it.

## Feature flags

PostHog's [feature flags](/docs/feature-flags) enable you to safely deploy and roll back new features as well as target specific users and groups with them.

### Boolean feature flags

```js-web
if (posthog.isFeatureEnabled('flag-key') ) {
    // Do something differently for this user

    // Optional: fetch the payload
    const matchedFlagPayload = posthog.getFeatureFlagPayload('flag-key')
}
```

### Multivariate feature flags

```js-web
if (posthog.getFeatureFlag('flag-key')  == 'variant-key') { // replace 'variant-key' with the key of your variant
    // Do something differently for this user
    
    // Optional: fetch the payload
    const matchedFlagPayload = posthog.getFeatureFlagPayload('flag-key')
}
```

### Ensuring flags are loaded before usage

Every time a user loads a page, we send a request in the background to fetch the feature flags that apply to that user. We store those flags in your chosen persistence option (local storage by default).

This means that for most pages, the feature flags are available immediately — **except for the first time a user visits**.

To handle this, you can use the `onFeatureFlags` callback to wait for the feature flag request to finish:

```js-web
posthog.onFeatureFlags(function (flags, flagVariants, { errorsLoading }) {
    // feature flags are guaranteed to be available at this point
    if (posthog.isFeatureEnabled('flag-key')) {
        // do something
    }
})
```

#### Callback parameters

The `onFeatureFlags` callback receives the following parameters:

- `flags: string[]`: An object containing the feature flags that apply to the user.

- `flagVariants: Record<string, string | boolean>`: An object containing the variants that apply to the user.

- `{ errorsLoading }: { errorsLoading?: boolean }`: An object containing a boolean indicating if an error occurred during the request to load the feature flags. This is `true` if the request timed out or if there was an error. It will be `false` or `undefined` if the request was successful.

You won't usually need to use these, but they are useful if you want to be extra careful about feature flags not being loaded yet because of a network error and/or a network timeout (see `feature_flag_request_timeout_ms`).

### Reloading feature flags

Feature flag values are cached. If something has changed with your user and you'd like to refetch their flag values, call:

```js-web
posthog.reloadFeatureFlags()
```

### Overriding server properties

Sometimes, you might want to evaluate feature flags using properties that haven't been ingested yet, or were set incorrectly earlier. You can do so by setting properties the flag depends on with these calls:

```js-web
posthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'})
```

> **Note:** These are set for the entire session. Successive calls are additive: all properties you set are combined together and sent for flag evaluation.

Whenever you set these properties, we also trigger a reload of feature flags to ensure we have the latest values. You can disable this by passing in the optional parameter for reloading:

```js-web
posthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'}, false)
```

At any point, you can reset these properties by calling `resetPersonPropertiesForFlags`:

```js-web
posthog.resetPersonPropertiesForFlags()
```

The same holds for [group](/manual/group-analytics) properties:

```js-web
// set properties for a group
posthog.setGroupPropertiesForFlags({'company': {'property1': 'value', property2: 'value2'}})

// reset properties for a given group:
posthog.resetGroupPropertiesForFlags('company')

// reset properties for all groups:
posthog.resetGroupPropertiesForFlags()
```

> **Note:** You don't need to add the group names here, since these properties are automatically attached to the current group (set via `posthog.group()`). When you change the group, these properties are reset.

#### Automatic overrides

Whenever you call `posthog.identify` with person properties, we automatically add these properties to flag evaluation calls to help determine the correct flag values. The same is true for when you call `posthog.group()`.

#### Default overridden properties

By default, we always override some properties based on the user IP address.

The list of properties that this overrides:

1. `$geoip_city_name`
2. `$geoip_country_name`
3. `$geoip_country_code`
4. `$geoip_continent_name`
5. `$geoip_continent_code`
6. `$geoip_postal_code`
7. `$geoip_time_zone`

This enables any geolocation-based flags to work without manually setting these properties.

### Request timeout

You can configure the `feature_flag_request_timeout_ms` parameter when initializing your PostHog client to set a flag request timeout. This helps prevent your code from being blocked in the case when PostHog's servers are too slow to respond. By default, this is set at 3 seconds.

```js
posthog.init('<ph_project_api_key>', { 
  api_host: '<ph_client_api_host>',
  defaults: '<ph_posthog_js_defaults>'
  feature_flag_request_timeout_ms: 3000 // Time in milliseconds. Default is 3000 (3 seconds).
})
```

### Feature flag error handling

When using the PostHog SDK, it's important to handle potential errors that may occur during feature flag operations. Here's an example of how to wrap PostHog SDK methods in an error handler:

```js
function handleFeatureFlag(client, flagKey, distinctId) {
  try {
    const isEnabled = client.isFeatureEnabled(flagKey, distinctId);
    console.log(`Feature flag '${flagKey}' for user '${distinctId}' is ${isEnabled ? 'enabled' : 'disabled'}`);
    return isEnabled;
  } catch (error) {
    console.error(`Error fetching feature flag '${flagKey}': ${error.message}`);
    // Optionally, you can return a default value or throw the error
    // return false; // Default to disabled
    throw error;
  }
}

// Usage example
try {
  const flagEnabled = handleFeatureFlag(client, 'new-feature', 'user-123');
  if (flagEnabled) {  
    // Implement new feature logic
  } else {
    // Implement old feature logic
  }
} catch (error) {
  // Handle the error at a higher level
  console.error('Feature flag check failed, using default behavior');
  // Implement fallback logic
}
```

### Bootstrapping flags

Since there is a delay between initializing PostHog and fetching feature flags, feature flags are not always available immediately. This makes them unusable if you want to do something like redirecting a user to a different page based on a feature flag.

To have your feature flags available immediately, you can initialize PostHog with precomputed values until it has had a chance to fetch them. This is called bootstrapping. After the SDK fetches feature flags from PostHog, it will use those flag values instead of bootstrapped ones.

For details on how to implement bootstrapping, see our [bootstrapping guide](/docs/feature-flags/bootstrapping).

### Enriched flag analytics

You can send enriched analytics data for feature flags to help uncover replays where people interact with a flag, target people who've interacted with a feature, or build cohorts of people who've viewed a feature.

To enable this, you can either use our `<PosthogFeature>` [React component](/docs/libraries/react#feature-flags-react-component) (which implements this for you), or implement it yourself.

To do it yourself, there are 3 things you need to do:

1. Whenever a feature is viewed, send the `$feature_view` event with the property `feature_flag` set to the name of the flag.

```javascript
posthog.capture('$feature_view', { feature_flag: flag })
```
2. Whenever someone interacts with a feature, send a `$feature_interaction` event with the property `feature_flag` set to the name of the flag.

3. At the same time, set the person property `$feature_interaction/<flag-key>` to true.

```javascript
posthog.capture('$feature_interaction', {
    feature_flag: flag,
    $set: { [`$feature_interaction/${flag}`]: true }
})
```

See [the React component](https://github.com/PostHog/posthog-js/blob/master/react/src/components/PostHogFeature.tsx#L48C10-L48C35) for another example.

## Experiments (A/B tests)

Since [experiments](/docs/experiments/manual) use feature flags, the code for running an experiment is very similar to the feature flags code:

```js-web
// Ensure flags are loaded before usage.
// You'll only need to call this on the code the first time a user visits.
// See this doc for more details: /docs/feature-flags/manual#ensuring-flags-are-loaded-before-usage
posthog.onFeatureFlags(function() {
  // feature flags should be available at this point
  if (posthog.getFeatureFlag('experiment-feature-flag-key')  == 'variant-name') {
    // do something
  }
})

// Otherwise, you can just do:
if (posthog.getFeatureFlag('experiment-feature-flag-key')  == 'variant-name') {
  // do something
}

// You can also test your code by overriding the feature flag:
// e.g., posthog.featureFlags.overrideFeatureFlags({ flags: {'experiment-feature-flag-key': 'test'}})
```

It's also possible to [run experiments without using feature flags](/docs/experiments/running-experiments-without-feature-flags).

## Early access feature management

Early access features give you the option to release feature flags that can be controlled by your users. More information on this can be found [here](/docs/feature-flags/early-access-feature-management).

```js-web
posthog.getEarlyAccessFeatures((previewItemData) => {
  // do something with early access feature
})
```

```js-web
posthog.updateEarlyAccessFeatureEnrollment(flagKey, 'true')
```

## Surveys

[Surveys](/docs/surveys) launched with [popover presentation](/docs/surveys/creating-surveys#presentation) are automatically shown to users matching the [display conditions](/docs/surveys/creating-surveys#display-conditions) you set up.

You can also [render *unstyled* surveys programmatically](/docs/surveys/implementing-custom-surveys) with the `renderSurvey` method.

```js-web
posthog.renderSurvey('survey_id', '#survey-container')
```

To disable loading surveys in a specific client, you can set the `disable_surveys` [config option](/docs/libraries/js/config).

Surveys using the **API** presentation enables you to implement your own survey UI and use PostHog to handle display logic, capturing results, and analytics.

To implement **API** surveys, start by fetching active surveys for a user using either of the methods below:

```js-web
// Fetch enabled surveys for the current user
posthog.getActiveMatchingSurveys(callback, forceReload)

// Fetch all surveys
posthog.getSurveys(callback, forceReload)
```

The response returns an array of survey objects and is cached by default. To force a reload, pass `true` as the `forceReload` argument.

The survey objects look like this:

```json
[{
  "id": "your_survey_id",
  "name": "Your survey name",
  "description": "Metadata describing your survey",
  "type": "api", // either "api", "popover", or "widget"
  "linked_flag_key": null, // linked feature flag key, if any.
  "targeting_flag_key": "your_survey_targeting_flag_key",
  "questions": [
    {
      "type": "single_choice",
      "choices": [
        "Yes",
        "No"
      ],
      "question": "Are you enjoying PostHog?"
    }
  ],
  "conditions": null,
  "start_date": "2023-09-19T13:10:49.505000Z",
  "end_date": null
}]
```

### Capturing survey events

To capture survey results properly in PostHog, you need to capture 3 types of events:

```js-web
// 1. When a user is shown a survey
posthog.capture("survey shown", {
  $survey_id: survey.id // required
})

// 2. When a user has dismissed a survey
posthog.capture("survey dismissed", {
  $survey_id: survey.id // required
})

// 3. When a user has responded to a survey
posthog.capture("survey sent", {
  $survey_id: survey.id, // required
  $survey_questions: [
    {
      id: "d8462827-1575-4e1e-ab1d-b5fddd9f829c",
      question: "What is your favorite color?",
    }
  ]
  $survey_response_d8462827-1575-4e1e-ab1d-b5fddd9f829c: survey_response // required. `survey_response` must be a text value.
  // Convert numbers to text e.g. 8 should be converted to "8".
  // For multiple choice select surveys, `survey_response` must be an array of values with the selected choices.
  // e.g., $survey_response_d8462827-1575-4e1e-ab1d-b5fddd9f829c: ["response_1", "response_2"]
})
```

## Session replay

To set up [session replay](/docs/session-replay) in your project, all you need to do is install the JavaScript web library and enable "Record user sessions" in [your project settings](https://us.posthog.com/settings/project-replay).

For [fine-tuning control](/docs/session-replay/how-to-control-which-sessions-you-record) of which sessions you record, you can use [feature flags](/docs/session-replay/how-to-control-which-sessions-you-record#with-feature-flags), [sampling](/docs/session-replay/how-to-control-which-sessions-you-record#sampling), [minimum duration](/docs/session-replay/how-to-control-which-sessions-you-record#minimum-duration), or set the `disable_session_recording` [config option](/docs/libraries/js/config) and use the following methods:

```js-web
// Turns session recording on
posthog.startSessionRecording()

// Turns session recording off
posthog.stopSessionRecording()

// Check if session recording is currently running
posthog.sessionRecordingStarted()
```

If you are using feature flags or sampling to control which sessions you record, you can override the default behavior (and start a recording regardless) by passing the `linked_flag` or `sampling` overrides. The following would start a recording for all users, even if they don't match the flag or aren't in the sample:

```js-web
posthog.startSessionRecording({ linked_flag: true, sampling: true })
```

To get the playback URL of the current session replay, you can use the following method:

```js-web
posthog.get_session_replay_url(
  { withTimestamp: true, timestampLookBack: 30 }
)
```

It has two optional parameters:

- `withTimestamp` (default: `false`): When set to `true`, the URL includes a timestamp that takes you to the session at the time of the event.
- `timestampLookBack` (default: `10`): The number of seconds back the timestamp links to.

Session replay uses [rrweb](https://github.com/rrweb-io/rrweb) under the hood, which is configurable with the `session_recording` parameter.

The documentation and defaults for these options can be found in the [rrweb docs](https://github.com/rrweb-io/rrweb/blob/master/guide.md#options).

The defaults are the same as in rrweb, except for these fields:

| key                      | PostHog default    | description                                                                                                                                                                                   |
| ------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| blockClass               | 'ph-no-capture'    | Use a string or RegExp to configure which elements should be blocked, refer to the [privacy](https://github.com/rrweb-io/rrweb/blob/master/guide.md#privacy) chapter                          |
| ignoreClass              | 'ph-ignore-input'  | Use a string or RegExp to configure which elements should be ignored, refer to the [privacy](https://github.com/rrweb-io/rrweb/blob/master/guide.md#privacy) chapter                          |
| maskTextClass            | 'ph-mask'          | Use a string or RegExp to configure which elements should be masked, refer to the [privacy](https://github.com/rrweb-io/rrweb/blob/master/guide.md#privacy) chapter                           |
| maskAllInputs            | true               | mask all input content as \*                                                                                                                                                                  |

The defaults for `maskAllInputs`, `maskTextSelector` and `blockSelector` will change depending on your masking configuration in the session replay section of [your project settings](https://us.posthog.com/settings/project-replay#replay-masking).

## Error tracking

You can enable [exception autocapture](/docs/error-tracking/installation) in the **Autocapture & heatmaps** section of [your project settings](https://us.posthog.com/settings/project-autocapture#exception-autocapture). When enabled, this automatically captures `$exception` events when errors are thrown.

It is also possible to manually capture exceptions using the `captureException` method:

```js
posthog.captureException(error, additionalProperties)
```

## Amending or sampling events

Since version 1.187.0, you can provide a `before_send` function when initializing the SDK to amend, filter, sample, or reject events before they are sent to PostHog.

> **🚨 Warning:** Amending and sampling events is advanced functionality that requires careful implementation. Core PostHog features may require 100% of unmodified events to function properly. We recommend only modifying or sampling your own custom events if possible, and preserving all PostHog internal events in their original form.

### Redacting information in events

`before_send` gives you one place to edit or redact information before it is sent to PostHog. For example:

<details>
<summary>Redact URLs in event properties</summary>

```ts
posthog.init('<ph_project_api_key>', {
    before_send: (event: CaptureResult | null): CaptureResult | null => {
        if (!event) {
            return null
        }

        // redacting URLs will be specific to your site structure
        function redactUrl(value: string): string {
            return value.replace(/project\/\d+/, 'project/1234567');
        }

        // NB these functions are examples and you should implement something specific to your site
        // redacting information can impact features that rely on it, e.g. heatmaps are keyed by URL
        function redactArray(value: any[]) {
            return value.map((v) => {
                if (typeof v === 'string') {
                    return redactUrl(v)
                } else if (Array.isArray(v)) {
                    return redactArray(v)
                } else if (typeof v === 'object' && v) {
                    return redactObject(v)
                } else {
                    return v
                }
            })
        }

        // NB these functions are examples and you should implement something specific to your site
        // redacting information can impact features that rely on it, e.g. heatmaps are keyed by URL
        function redactObject(objectToRedact: Record<string, any>): Record<string, any> {
            return Object.entries(objectToRedact).reduce((acc, [key, value]) => {
                if ((key.includes('url') || key.includes('href')) && typeof value === 'string') {
                    acc[key] = redactUrl(value)
                } else if (Array.isArray(value)) {
                    acc[key] = redactArray(value)
                } else if (typeof value === 'object' && value) {
                    acc[key] = redactObject(value)
                } else {
                    acc[key] = value
                }
                return acc
            }, {});
        }

        const redactedProperties = redactObject(event.properties || {});
        event.properties = redactedProperties

        const redactedSet = redactObject(event.$set || {});
        event.$set = redactedSet

        const redactedSetOnce = redactObject(event.$set_once || {});
        event.$set_once = redactedSetOnce

        return event
    }
})
```

</details>

<details>
<summary>Redact person properties in $set or $set_once</summary>

```ts
posthog.init('<ph_project_api_key>', {
    before_send: (event: CaptureResult | null): CaptureResult | null => {
        if (!event) {
            return null
        }

        event.$set = {
            ...event.$set,
            name: 'secret name'
        }
        event.$set_once = {
            ...event.$set_once,
            initial_name: 'secret name'
        }

        return event
    }
})
```

</details>

### Sampling events

Sampling lets you choose to send only a percentage of events to PostHog. It is a good way to control your costs without having to completely turn off features of the SDK.

Some functions of PostHog, for example much of web analytics, rely on receiving all events. Sampling `$pageview ` or `$pageleave` events in particular can cause unexpected results.

#### Sampling events using our provided customization

We offer a pre-built `sampleByEvent` function to sample by event name. You can import this using a package manager, or add the customization script to your site.

<MultiLanguage>

```ts file=Import
import { sampleByEvent } from 'posthog-js/lib/src/customizations'

posthog.init('<ph_project_api_key>', {
  // capture only half of dead click and web vitals events
  before_send: sampleByEvent(['$dead_click', '$web_vitals'], 0.5)
})
```

```tsx file=Script
// Add this script to your site, may need to change the script src to match your API host:
// <script type="text/javascript" src="https://us.i.posthog.com/static/customizations.full.js"></script>

posthog.init('<ph_project_api_key>', {
  // capture only half of dead click and web vitals events
  before_send: posthogCustomizations.sampleByEvent(['$dead_click', '$web_vitals'], 0.5)
})
```

</MultiLanguage>

This can be used to sample events by name, distinct ID, session ID, or custom function.

<details>
<summary>Send no events while developing</summary>

When working locally it can be useful to see what PostHog would do, without actually sending the data to PostHog

```ts
posthog.init('<ph_project_api_key>', {
  before_send: (event: CaptureResult | null): CaptureResult | null => {
    if (event) {
      console.log('posthog event: ' + event.event, event)
    }
    return null
  }
})
```

</details>

<details>
<summary>Sampling by person distinct ID</summary>

We offer a pre-built `sampleByDistinctId` function to sample a percentage of events by person distinct ID (in the example below, 40% of events). You can import this using a package manager, or add the customization script to your site.

> **Note:** A particular distinct ID will always either send all events or no events.

<MultiLanguage>

```ts file=Import
import { sampleByDistinctId } from 'posthog-js/lib/src/customizations'

posthog.init('<ph_project_api_key>', {
  before_send: sampleByDistinctId(0.4)
})
```

```ts file=Script
// Add this script to your site, may need to change the script src to match your API host:
// <script type="text/javascript" src="https://us.i.posthog.com/static/customizations.full.js"></script>

posthog.init('<ph_project_api_key>', {
  before_send: posthogCustomizations.sampleByDistinctId(0.4)
})
```

</MultiLanguage>

</details>

<details>
<summary>Sampling by session ID</summary>

We offer a pre-built `sampleBySessionId` function to sample a percentage of events by session ID (in the example below, 25% of events). You can import this using a package manager, or add the customization script to your site.

> **Note:** A particular session ID will always either send all events or no events.

<MultiLanguage>

```ts file=Import
import { sampleBySessionId } from 'posthog-js/lib/src/customizations'

posthog.init('<ph_project_api_key>', {
  before_send: sampleBySessionId(0.25)
})
```

```ts file=Script
// Add this script to your site, may need to change the script src to match your API host:
// <script type="text/javascript" src="https://us.i.posthog.com/static/customizations.full.js"></script>

posthog.init('<ph_project_api_key>', {
  before_send: posthogCustomizations.sampleBySessionId(0.25)
})
```

</MultiLanguage>

</details>

<details>
<summary>Sampling events using a custom function</summary>

If none of the provided sampling functions meet your needs, you can provide a custom function to sample events.

```ts
posthog.init('<ph_project_api_key>', {
  before_send: (event: CaptureResult | null): CaptureResult | null => {
    if (!event) {
      return null
    }

    let sampleRate = 1.0 // default to always returning the event
    if (event.event === '$heatmap') {
      sampleRate = 0.1
    }
    if (event.event === '$dead_click') {
      sampleRate = 0.01
    }
    return Math.random() < sampleRate ? event : null
  }
})
```

</details>

### Chaining before_send functions

You can provide an array of functions to be called one after the other:

```ts
posthog.init('<ph_project_api_key>', {
  before_send: [
    sampleByDistinctId(0.5), // only half of people
    sampleByEvent(['$web_vitals'], 0.1), // and they capture all events except 10% of web vitals
    sampleByEvent(['$$heatmap'], 0.5), // and 50% of heatmaps
  ]
})
```

## Blocking bad actors

PostHog tries to automatically block known crawlers and web/AI agents. It's a fact, however, that not every crawler will advertise themselves as a crawler.

If you see an unusual number of visitors in your project, you can try and understand where they're coming from by using [web analytics](https://us.posthog.com/web). It's common, however, that they will all contain the exact same user agent string. You can verify the most common user agents by using [this trend insight](https://app.posthog.com/insights/new#q=%7B%22kind%22%3A%22InsightVizNode%22%2C%22source%22%3A%7B%22kind%22%3A%22TrendsQuery%22%2C%22series%22%3A%5B%7B%22kind%22%3A%22EventsNode%22%2C%22name%22%3A%22%24pageview%22%2C%22event%22%3A%22%24pageview%22%2C%22math%22%3A%22total%22%7D%5D%2C%22trendsFilter%22%3A%7B%7D%2C%22breakdownFilter%22%3A%7B%22breakdowns%22%3A%5B%7B%22property%22%3A%22%24raw_user_agent%22%2C%22type%22%3A%22event%22%7D%5D%7D%7D%7D%20).

If a specific user agent is causing problems (many more events than other user agents), you can block it by adding it to `custom_blocked_useragents` in your PostHog initialization:

```ts
posthog.init('<ph_project_api_key>', {
  custom_blocked_useragents: ['<user_agent_string>']
})
```

### Lighthouse audits

Lighthouse is known for not advertising itself. If you're using a tool that uses Lighthouse to monitor your website (or if a competitor does), PostHog won't be able to prevent those events by default, which might skew your numbers. Ahrefs and Semrush are examples of this.

Lighthouse user agents are well-known but they're not blocked by default because they represent possibly legitimate users. If you're experiencing a high number of events from these sources, you can block them by adding them to your `custom_blocked_useragents` list in your PostHog initialization:

```ts
const LIGHTHOUSE_USER_AGENTS = [
  'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
]

posthog.init('<ph_project_api_key>', {
  custom_blocked_useragents: LIGHTHOUSE_USER_AGENTS
})
```

### Removing already ingested events

Deleting already ingested events is complicated, but you can add user agents to the [internal and test accounts filter](https://us.posthog.com/settings/project-product-analytics#internal-user-filtering) in your project settings to filter them from your analytics.

# JavaScript web configuration

When calling `posthog.init`, there are various configuration options you can set to customize and control the behavior of PostHog.

To configure these options, pass them as an object to the `posthog.init` call, like we do with `api_host`, `defaults`, `loaded`, and `autocapture` below.

```ts
posthog.init('<ph_project_api_key>', {
    api_host: '<ph_client_api_host>',
    defaults: '<ph_posthog_js_defaults>',
    loaded: function (posthog) {
        posthog.identify('[user unique id]')
    },
    autocapture: false,
    // ... more options
})
```

You can also use the `posthog.set_config` method to change the configuration after initialization.

```ts
posthog.set_config({
  persistence: 'localStorage+cookie',
})
```

There are many configuration options, most of which you do not have to ever worry about. For brevity, only the most relevant ones are used here; however, you can view all options in the [`PostHogConfig` specification](/docs/references/posthog-js/types/PostHogConfig).

Some of the most relevant options are:

| Attribute                                                                                                                                                                                 | Description                                                                                                                                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api_host`<br/><br/>**Type:** String<br/>**Default:** `https://us.i.posthog.com`                                                                                                          | URL of your PostHog instance.                                                                                                                                                                                                                                                                                  |
| `ui_host`<br/><br/>**Type:** String<br/>**Default:** undefined                                                                                                                             | If using a [reverse proxy](/docs/advanced/proxy) for `api_host` then this should be the actual PostHog app URL (e.g. `https://us.posthog.com`). This ensures that links to PostHog point to the correct host.                                                                                                  |
| `autocapture`<br/><br/>**Type:** Boolean or AutocaptureConfig<br/>**Default:** `true`                                                                                                      | Determines if PostHog should [autocapture](/docs/product-analytics/autocapture) events. This setting does not affect capturing pageview events (see `capture_pageview`).  [See below for `AutocaptureConfig`](#configuring-autocapture)                                                                          |
| `before_send`<br/><br/>**Type:** Function<br/>**Default:** `function () {}`                                                                                                               | A function that allows you to amend or reject events before they are sent to PostHog. [See below for more information](/docs/libraries/js/features#amending-or-sampling-events)                                                                                                                                |
| `bootstrap`<br/><br/>**Type:** Object<br/>**Default:** `{}`                                                                                                                               | An object containing the `distinctID`, `isIdentifiedID`, and `featureFlags` keys, where `distinctID` is a string, and `featureFlags` is an object of key-value pairs                                                                                                                                            |
| `capture_pageview`<br/><br/>**Type:** Boolean or String<br/>**Default:** `true`                                                                                                           | Determines if PostHog should automatically capture pageview events. The default is to capture using page load events. If the special string `history_change` is provided, PostHog will capture pageviews based on path changes by listening to the browser's history API which is useful for single page apps. `history_change` is the default if you choose to set `defaults: '2025-05-24'` or later. |
| `capture_pageleave`<br/><br/>**Type:** Boolean<br/>**Default:** `true`                                                                                                                    | Determines if PostHog should automatically capture pageleave events.                                                                                                                                                                                                                                           |
| `capture_dead_clicks`<br/><br/>**Type:** Boolean<br/>**Default:** `true`                                                                                                                  | Determines if PostHog should automatically capture dead click events.                                                                                                                                                                                                                                          |
| `cross_subdomain_cookie`<br/><br/>**Type:** Boolean<br/>**Default:** `true`                                                                                                               | Determines if cookie should be set on the top level domain (example.com). If `posthog-js` is loaded on a subdomain (`test.example.com`), _and_ `cross_subdomain_cookie` is set to false, it'll set the cookie on the subdomain only (`test.example.com`).                                                      |
| [`custom_blocked_useragents`](/docs/libraries/js/features#blocking-bad-actors)<br/><br/>**Type:** Array<br/>**Default:** `[]`                                                             | A list of user agents to block when sending events.                                                                                                                                                                                                                                                            |
| `defaults`<br/><br/>**Type:** String<br/>**Default:** `unset`                                                                                                                             | Whether we should use the most recent set of defaults or the legacy ones. Will use the legacy ones by default, set to `'<ph_posthog_js_defaults>'` to use the most recent defaults.                                                                                                                            |
| `disable_persistence`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                                 | Disable persisting user data across pages. This will disable cookies, session storage and local storage.                                                                                                                                                                                                       |
| `disable_surveys`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                                     | Determines if surveys script should load which controls whether they show up for users, and whether requests for API surveys return valid data                                                                                                                                                                 |
| `disable_session_recording`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                           | Determines if users should be opted out of session recording.                                                                                                                                                                                                                                                  |
| `enable_recording_console_log`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                        | Determines if console logs should be recorded as part of the session recording. [More information](/docs/session-replay/manual#console-logs-recording).                                                                                                                                                        |
| `enable_heatmaps`<br/><br/>**Type:** Boolean<br/>**Default:** undefined                                                                                                                    | Determines if heatmap data should be captured.                                                                                                                                                                                                                                                                 |
| `evaluation_environments`<br/><br/>**Type:** Array of Strings<br/>**Default:** `undefined`                                                                                                 | Environment environments that constrain which feature flags are evaluated. When set, only flags with matching evaluation environments (or no evaluation environments) will be returned. This helps reduce unnecessary flag evaluations and improves performance. See [evaluation environments documentation](/docs/feature-flags/evaluation-environments) for more details. |
| `loaded`<br/><br/>**Type:** Function<br/>**Default:** `function () {}`                                                                                                                    | A function to be called once the PostHog scripts have loaded successfully.                                                                                                                                                                                                                                     |
| `mask_all_text`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                                       | Prevent PostHog autocapture from capturing any text from your elements.                                                                                                                                                                                                                                        |
| `mask_all_element_attributes`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                         | Prevent PostHog autocapture from capturing any attributes from your elements.                                                                                                                                                                                                                                  |
| `opt_out_capturing_by_default`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                        | Determines if users should be opted out of PostHog tracking by default, requiring additional logic to opt them into capturing by calling `posthog.opt_in_capturing`.                                                                                                                                           |
| `opt_out_persistence_by_default`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                                                                                                      | Determines if users should be opted out of browser data storage by this PostHog instance by default, requiring additional logic to opt them into capturing by calling `posthog.opt_in_capturing`.                                                                                                              |
| `persistence`<br/><br/>**Type:** Enum: `localStorage`, `sessionStorage`, `cookie`, `memory`, or `localStorage+cookie`<br/>**Default:** `localStorage+cookie`                              | Determines how PostHog stores information about the user. See [persistence](/docs/libraries/js/persistence) for details.                                                                                                                                                                                       |
| `property_denylist`<br/><br/>**Type:** Array<br/>**Default:** `[]`                                                                                                                        | A list of properties that should never be sent with `capture` calls.                                                                                                                                                                                                                                           |
| `person_profiles`<br /><br />**Type:** Enum: `always`, `identified_only`<br/>**Default:** `identified_only`                                                                                  | Set whether events should capture identified events and process person profiles                                                                                                                                                                                                                                  |
| `rate_limiting`<br/><br/>**Type:** Object<br/>**Default:** `{ events_per_second: 10, events_burst_limit: events_per_second * 10 }`                                                        | Controls event rate limiting to help you avoid accidentally sending too many events. `events_per_second` determines how many events can be sent per second on average (default: 10). `events_burst_limit` sets the maximum events that can be sent at once (default: 10 times the `events_per_second` value).  |
| `session_recording`<br/><br/>**Type:** Object<br/>**Default:** [See here.](https://github.com/PostHog/posthog-js/blob/96fa9339b9c553a1c69ec5db9d282f31a65a1c25/src/posthog-core.js#L1032) | Configuration options for recordings. More details [found here](/docs/session-replay/manual)                                                                                                                                                                                                                    |
| `session_idle_timeout_seconds`<br/><br/>**Type:** Integer<br/>**Default:** `1800`                                                                                                         | The maximum amount of time a session can be inactive before it is split into a new session.                                                                                                                                                                                                                    |
| `xhr_headers`<br/><br/>**Type:** Object<br/>**Default:** `{}`                                                                                                                             | Any additional headers you wish to pass with the XHR requests to the PostHog API.                                                                                                                                                                                                                              |
| `rageclick`<br/><br/>**Type:** Boolean or RageclickConfig<br/>**Default:** `true`                                                                                                      | Determines if PostHog should automatically capture rage click events when users rapidly click on elements that don't respond. [See below for `RageclickConfig`](#configuring-rageclick)                                                                          |                                                                    |

## Configuring autocapture

The `autocapture` config takes an object providing full control of autocapture's behavior.

| Attribute                                                                                        | Description                                                                                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url_allowlist`<br/><br/>**Type:** Array of Strings or Regexp<br/>**Default:** `undefined`       | List of URLs to enable autocapture on, can be string or regex matches e.g. `['https://example.com', 'test.com/.*']`. An empty list means no URLs are allowed for capture, `undefined` means all URLs are.                                    |
| `dom_event_allowlist`<br/><br/>**Type:** Array of Strings <br/>**Default:** `undefined`          | An array of DOM events, like **click**, **change**, **submit**,  to enable autocapture on. An empty array means no events are enable for capture, `undefined` means all are.                                                                 |
| `element_allowlist`<br/><br/>**Type:** Array of Strings <br/>**Default:** `undefined`            | An array of DOM elements, like **a**, **button**, **form**, **input**, **select**, **textarea**, or **label** to allow autocapture on. An empty array means no elements are enabled for capture, `undefined` means all elements are enabled. |
| `css_selector_allowlist`<br/><br/>**Type:** Array of Strings <br/>**Default:** `undefined`       | An array of CSS selectors to enable autocapture on. An empty array means no CSS selectors are allowed for capture, `undefined` means all CSS selectors are.                                                                                  |
| `element_attribute_ignorelist`<br/><br/>**Type:** Array of Strings <br/>**Default:** `undefined` | An array of element attributes that autocapture will not capture. Both an empty array and `undefined` mean any of the attributes from the element are captured.                                                                              |
| `capture_copied_text`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                        | When set to true, autocapture will capture the text of any element that is cut or copied.                                                                                                                                                    | 

## Configuring rageclick

We provide a convenient `.ph-no-rageclick` class that automatically excludes elements from rage click tracking. 

But if you need more control, we also provide a `rageclick` config that takes an object providing control over rage click event detection. 

| Attribute | Description |
|-----------|-------------|
| `css_selector_ignorelist`<br/><br/>**Type:** Array of Strings<br/>**Default:** `undefined` | List of CSS selectors to ignore rage clicks on, e.g. `['.carousel-button', '.next-button']`. Elements matching these selectors (or their parents) won't trigger rage click events. An empty array disables rage click events all together. Providing any value overrides the defaults, so PostHog will *only* ignore the selectors you explicitly provide in the array. |

## Advanced configuration

These are features for advanced users and may lead to unintended side effects if not reviewed carefully. 

| Attribute                                                                                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `advanced_disable_flags`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                       | Will completely disable the `/flags` endpoint request (and features that rely on it). More details below.                                                                                                                                                                                                                                                                                                                              |
| `advanced_disable_decide`<br/><br/>**Type:** Boolean<br/>**Default:** `false`                      | Legacy, prefer `advanced_disable_flags`.  This configuration option behaves like `advanced_disable_flags` but will be deprecated in the future.
| `advanced_disable_feature_flags`<br/><br/>**Type:** Boolean<br/>**Default:** `false`               | Will keep `/flags` running, but without any feature flag requests. Important: do not use this argument if using surveys, as display conditions rely on feature flags internally.                                                                                                                                                                                                                                                       |
| `advanced_disable_feature_flags_on_first_load`<br/><br/>**Type:** Boolean<br/>**Default:** `false` | Stops from firing feature flag requests on first page load. Only requests feature flags when user identity or properties are updated, or you manually request for flags to be loaded.                                                                                                                                                                                                                                                  |
| `advanced_only_evaluate_survey_feature_flags`<br/><br/>**Type:** Boolean<br/>**Default:** `false`  | Determines whether PostHog should only evaluate feature flags for surveys. Useful for when you want to use this library to evaluate feature flags for surveys only but you have additional feature flags that you evaluate on the server side.
| `feature_flag_request_timeout_ms`<br/><br/>**Type:** Integer<br/>**Default:** `3000`               | Sets timeout for fetching feature flags                                                                                                                                                                                                                                                                                                                                                                                                |
| `secure_cookie` <br/><br/>**Type:** Boolean<br/>**Default:** `false`                               | If this is `true`, PostHog cookies will be marked as secure, meaning they will only be transmitted over HTTPS.                                                                                                                                                                                                                                                                                                                         |
| `custom_campaign_params` <br/><br/>**Type:** Array<br/>**Default:** `[]`                           | List of query params to be automatically captured (see [UTM Segmentation](/docs/data/utm-segmentation) )                                                                                                                                                                                                                                                                                                                               |
| `fetch_options.cache` <br/><br/>**Type:** string<br/>**Default:** `undefined`                      | `fetch` call cache behavior (see [MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/RequestInit#cache) to understand available options). It's important when using NextJS, see [companion documentation](https://nextjs.org/docs/app/api-reference/functions/fetch#fetchurl-options). This is a tricky option, avoid using it unless you are aware of the changes this could cause - such as cached feature flag values, etc. |
| `fetch_options.next_options` <br/><br/>**Type:** Object<br/>**Default:** `undefined`               | Arguments to be passed to the `next` key when calling `fetch` under NextJS. See [companion documentation](https://nextjs.org/docs/app/api-reference/functions/fetch#optionsnextrevalidate).                                                                                                                                                                                                                                            |
| `on_request_error` <br/><br/>**Type:** Function<br/>**Default:** `logger.error('Bad HTTP status: ' + res.statusCode + ' ' + res.text)`  | Called whenever a PostHog request fails with an HTTP status code of 400 or higher. The callback function receives a `RequestResponse` object with the `statusCode`, `text`, and `json` (if available).                                                                                                                                                                                            |


### Disable `/flags` endpoint

> **Note:** This feature was introduced in `posthog-js` 1.10.0. Previously, disabling autocapture would inherently disable the `/flags` endpoint altogether. This meant that disabling autocapture would inadvertently turn off session recording, feature flags, compression, and the toolbar too.

One of the first things the PostHog does after initializing is make a request to [the `/flags` endpoint](/docs/api/flags) on PostHog's backend. This endpoint contains information on how to run the PostHog library so events are properly received in the backend and is required to run most features of the library (detailed below).

If you're not using any of these features, you may wish to turn off the call completely to avoid an extra request and reduce resource usage on both the client and the server.

The `/flags` endpoint can be disabled by setting `advanced_disable_flags` to `true`.

#### Resources dependent on `/flags`

> **Warning:** These are features/resources that are fully disabled when the `/flags` endpoint is disabled.

-   **Autocapture**. The `/flags` endpoint contains information on whether autocapture should be enabled or not (apart from local configuration).
-   **Session recording**. The endpoint contains information on where to send relevant session recording events.
-   **Compression**. The endpoint contains information on what compression methods are supported on the backend (e.g. LZ64, gzip) for event payloads.
-   **Feature flags**. The endpoint contains the feature flags enabled for the current person.
-   **Surveys**. The endpoint contains information on whether surveys should be enabled or not.
-   **Toolbar**. The endpoint contains authentication information and other toolbar capabilities information required to run it.

Any custom event captures (`posthog.capture`), `$identify`, `$set`, `$set_once` and basically any other calls not detailed above will work as expected when `/flags` is disabled.

# JavaScript web persistence and cookies

For PostHog to work optimally, we store a small amount of information about the user on the user's browser. This ensures we identify users properly if they navigate away from your site and come back later. 

The information we store includes:

-   Their `distinct_id`
-   Session ID & Device ID
-   Active & enabled feature flags
-   Any super properties you have defined
-   Some PostHog configuration options (e.g. whether session recording is enabled)

By default, we store all this information in both a `cookie` and `localStorage`, which means PostHog can identify your users across subdomains. By default, the name of the cookie PostHog sets is `ph_<project_api_key>_posthog` and it expires after `365` days.

If you want to change how PostHog stores this information, you can do so with the `persistence` configuration option:

- `persistence: "localStorage+cookie"` (default): Limited things are stored in the cookie such as the distinctID and the sessionID, and everything else in the browser's <a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage" target="_blank">`localStorage`</a>.

- `persistence: "cookie"` : Stores all data in a cookie.

- `persistence: "localStorage"`: Stores everything in `localStorage`.

- `persistence: "sessionStorage"`: Stores everything in `sessionStorage`.

- `persistence: "memory"`: Stores everything in page memory, which means data is only persisted for the duration of the page view.

To change `persistence` values without reinitializing PostHog, you can use the `posthog.set_config()` method. This enables you to switch from memory to cookies to better comply with privacy regulations.

```js-web
const handleCookieConsent = (consent) => {
  posthog.set_config({ persistence: consent === 'yes' ? 'localStorage+cookie' : 'memory' });
  localStorage.setItem('cookie_consent', consent);
};
```

## Persistence caveats

- Be aware that `localStorage` and `sessionStorage` can't be used across subdomains. If you have multiple sites on the same domain, you may want to consider a `cookie` option or make sure to set all super properties across each subdomain.

- Due to the size limitation of cookies you may run into `431 Request Header Fields Too Large` errors (e.g. if you have a lot of feature flags). In that case, use `localStorage+cookie`.

- If you don't want PostHog to store anything on the user's browser (e.g. if you want to rely on your own identification mechanism only or want completely anonymous users), you can set `disable_persistence: true` in PostHog's config. If you do this, remember to call [`posthog.identify`](/docs/libraries/js/features#identifying-users) **every time** your app loads. If you don't, every page refresh is treated as a new and different user.

- For browser extensions, use `localStorage`, `sessionStorage`, or `memory`. Each extension context may initialize its own PostHog instance. These contexts don't share storage so the instances don't know about each other. Since `browser.storage` and `chrome.storage` APIs are not supported for data persistence, you'll need to provide your own shared `distinct_id` during each initialization to ensure events are sent under the same identifier. See the [browser extension documentation](/docs/advanced/browser-extension) for more details.


{
  "info": {
    "description": "Posthog-js allows you to automatically capture usage and send events to PostHog.",
    "id": "posthog-js",
    "specUrl": "https://github.com/PostHog/posthog-js",
    "slugPrefix": "posthog-js",
    "title": "PostHog JavaScript Web SDK",
    "version": "1.285.1"
  },
  "referenceId": "posthog-js",
  "hogRef": "0.3",
  "id": "posthog-js-latest",
  "categories": [
    "Initialization",
    "Identification",
    "Capture",
    "Surveys",
    "Error tracking",
    "LLM analytics",
    "Privacy",
    "Session replay",
    "Feature flags",
    "Toolbar"
  ],
  "classes": [
    {
      "description": "This is the SDK reference for the PostHog JavaScript Web SDK. You can learn more about example usage in the [JavaScript Web SDK documentation](/docs/libraries/js). You can also follow [framework specific guides](/docs/frameworks) to integrate PostHog into your project.\nThis SDK is designed for browser environments. Use the PostHog [Node.js SDK](/docs/libraries/node) for server-side usage.",
      "functions": [
        {
          "category": "",
          "description": "Constructs a new instance of the `PostHog` class",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for PostHog\nposthog.PostHog();",
              "name": "Generated example for PostHog",
              "id": "posthog"
            }
          ],
          "id": "PostHog",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "any",
            "name": "any"
          },
          "title": "PostHog"
        },
        {
          "category": "Identification",
          "description": "Creates an alias linking two distinct user identifiers. Learn more about [identifying users](/docs/product-analytics/identify)",
          "details": "PostHog will use this to link two distinct_ids going forward (not retroactively). Call this when a user signs up to connect their anonymous session with their account.",
          "examples": [
            {
              "code": "\n\n// link anonymous user to account on signup\nposthog.alias('user_12345')\n\n\n",
              "name": "link anonymous user to account on signup",
              "id": "link_anonymous_user_to_account_on_signup"
            },
            {
              "code": "\n\n// explicit alias with original ID\nposthog.alias('user_12345', 'anonymous_abc123')\n\n\n\n",
              "name": "explicit alias with original ID",
              "id": "explicit_alias_with_original_id"
            }
          ],
          "id": "alias",
          "params": [
            {
              "description": "A unique identifier that you want to use for this user in the future.",
              "isOptional": false,
              "name": "alias",
              "type": "string"
            },
            {
              "description": "The current identifier being used for this user.",
              "isOptional": true,
              "name": "original",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "CaptureResult | void | number",
            "name": "CaptureResult | void | number"
          },
          "title": "alias"
        },
        {
          "category": "Surveys",
          "description": "Checks the feature flags associated with this Survey to see if the survey can be rendered. This method is deprecated because it's synchronous and won't return the correct result if surveys are not loaded. Use `canRenderSurveyAsync` instead.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for canRenderSurvey\nposthog.canRenderSurvey();",
              "name": "Generated example for canRenderSurvey",
              "id": "canrendersurvey"
            }
          ],
          "id": "canRenderSurvey",
          "params": [
            {
              "description": "The ID of the survey to check.",
              "isOptional": false,
              "name": "surveyId",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "deprecated",
          "showDocs": true,
          "returnType": {
            "id": "SurveyRenderReason | null",
            "name": "SurveyRenderReason | null"
          },
          "title": "canRenderSurvey"
        },
        {
          "category": "Surveys",
          "description": "Checks the feature flags associated with this Survey to see if the survey can be rendered.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.canRenderSurveyAsync(surveyId).then((result) => {\n    if (result.visible) {\n        // Survey can be rendered\n        console.log('Survey can be rendered')\n    } else {\n        // Survey cannot be rendered\n        console.log('Survey cannot be rendered:', result.disabledReason)\n    }\n})\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "canRenderSurveyAsync",
          "params": [
            {
              "description": "The ID of the survey to check.",
              "isOptional": false,
              "name": "surveyId",
              "type": "string"
            },
            {
              "description": "If true, the survey will be reloaded from the server, Default: false",
              "isOptional": true,
              "name": "forceReload",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "Promise<SurveyRenderReason>",
            "name": "Promise<SurveyRenderReason>"
          },
          "title": "canRenderSurveyAsync"
        },
        {
          "category": "Capture",
          "description": "Captures an event with optional properties and configuration.",
          "details": "You can capture arbitrary object-like values as events. [Learn about capture best practices](/docs/product-analytics/capture-events)",
          "examples": [
            {
              "code": "\n\n// basic event capture\nposthog.capture('cta-button-clicked', {\n    button_name: 'Get Started',\n    page: 'homepage'\n})\n\n\n\n\n\n",
              "name": "basic event capture",
              "id": "basic_event_capture"
            }
          ],
          "id": "capture",
          "params": [
            {
              "description": "The name of the event (e.g., 'Sign Up', 'Button Click', 'Purchase')",
              "isOptional": false,
              "name": "event_name",
              "type": "EventName"
            },
            {
              "description": "Properties to include with the event describing the user or event details",
              "isOptional": true,
              "name": "properties",
              "type": "Properties | null"
            },
            {
              "description": "Optional configuration for the capture request",
              "isOptional": true,
              "name": "options",
              "type": "CaptureOptions"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "CaptureResult | undefined",
            "name": "CaptureResult | undefined"
          },
          "title": "capture"
        },
        {
          "category": "Error tracking",
          "description": "Capture a caught exception manually",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Capture a caught exception\ntry {\n  // something that might throw\n} catch (error) {\n  posthog.captureException(error)\n}\n\n\n",
              "name": "Capture a caught exception",
              "id": "capture_a_caught_exception"
            },
            {
              "code": "\n\n// With additional properties\nposthog.captureException(error, {\n  customProperty: 'value',\n  anotherProperty: ['I', 'can be a list'],\n  ...\n})\n\n\n\n",
              "name": "With additional properties",
              "id": "with_additional_properties"
            }
          ],
          "id": "captureException",
          "params": [
            {
              "description": "The error to capture",
              "isOptional": false,
              "name": "error",
              "type": "unknown"
            },
            {
              "description": "Any additional properties to add to the error event",
              "isOptional": true,
              "name": "additionalProperties",
              "type": "Properties"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "CaptureResult | undefined",
            "name": "CaptureResult | undefined"
          },
          "title": "captureException"
        },
        {
          "category": "LLM analytics",
          "description": "Capture written user feedback for a LLM trace. Numeric values are converted to strings.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for captureTraceFeedback\nposthog.captureTraceFeedback();",
              "name": "Generated example for captureTraceFeedback",
              "id": "capturetracefeedback"
            }
          ],
          "id": "captureTraceFeedback",
          "params": [
            {
              "description": "The trace ID to capture feedback for.",
              "isOptional": false,
              "name": "traceId",
              "type": "string | number"
            },
            {
              "description": "The feedback to capture.",
              "isOptional": false,
              "name": "userFeedback",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "captureTraceFeedback"
        },
        {
          "category": "LLM analytics",
          "description": "Capture a metric for a LLM trace. Numeric values are converted to strings.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for captureTraceMetric\nposthog.captureTraceMetric();",
              "name": "Generated example for captureTraceMetric",
              "id": "capturetracemetric"
            }
          ],
          "id": "captureTraceMetric",
          "params": [
            {
              "description": "The trace ID to capture the metric for.",
              "isOptional": false,
              "name": "traceId",
              "type": "string | number"
            },
            {
              "description": "The name of the metric to capture.",
              "isOptional": false,
              "name": "metricName",
              "type": "string"
            },
            {
              "description": "The value of the metric to capture.",
              "isOptional": false,
              "name": "metricValue",
              "type": "string | number | boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "captureTraceMetric"
        },
        {
          "category": "Privacy",
          "description": "Clear the user's opt in/out status of data capturing and cookies/localstorage for this PostHog instance",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for clear_opt_in_out_capturing\nposthog.clear_opt_in_out_capturing();",
              "name": "Generated example for clear_opt_in_out_capturing",
              "id": "clear_opt_in_out_capturing"
            }
          ],
          "id": "clear_opt_in_out_capturing",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "clear_opt_in_out_capturing"
        },
        {
          "category": "Identification",
          "description": "Creates a person profile for the current user, if they don't already have one and config.person_profiles is set to 'identified_only'. Produces a warning and does not create a profile if config.person_profiles is set to 'never'. Learn more about [person profiles](/docs/product-analytics/identify)",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.createPersonProfile()\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "createPersonProfile",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "createPersonProfile"
        },
        {
          "category": "Initialization",
          "description": "Enables or disables debug mode for detailed logging.",
          "details": "Debug mode logs all PostHog calls to the browser console for troubleshooting. Can also be enabled by adding `?__posthog_debug=true` to the URL.",
          "examples": [
            {
              "code": "\n\n// enable debug mode\nposthog.debug(true)\n\n\n",
              "name": "enable debug mode",
              "id": "enable_debug_mode"
            },
            {
              "code": "\n\n// disable debug mode\nposthog.debug(false)\n\n\n\n",
              "name": "disable debug mode",
              "id": "disable_debug_mode"
            }
          ],
          "id": "debug",
          "params": [
            {
              "description": "If true, will enable debug mode.",
              "isOptional": true,
              "name": "debug",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "debug"
        },
        {
          "category": "Surveys",
          "description": "Display a survey programmatically as either a popover or inline element.",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Display as popover (respects all conditions defined in the dashboard)\nposthog.displaySurvey('survey-id-123')\n\n\n",
              "name": "Display as popover (respects all conditions defined in the dashboard)",
              "id": "display_as_popover_(respects_all_conditions_defined_in_the_dashboard)"
            },
            {
              "code": "\n\n// Display inline in a specific element\nposthog.displaySurvey('survey-id-123', {\n  displayType: DisplaySurveyType.Inline,\n  selector: '#survey-container'\n})\n\n\n",
              "name": "Display inline in a specific element",
              "id": "display_inline_in_a_specific_element"
            },
            {
              "code": "\n\n// Force display ignoring conditions and delays\nposthog.displaySurvey('survey-id-123', {\n  displayType: DisplaySurveyType.Popover,\n  ignoreConditions: true,\n  ignoreDelay: true\n})\n\n\n\n",
              "name": "Force display ignoring conditions and delays",
              "id": "force_display_ignoring_conditions_and_delays"
            }
          ],
          "id": "displaySurvey",
          "params": [
            {
              "description": "The survey ID to display",
              "isOptional": false,
              "name": "surveyId",
              "type": "string"
            },
            {
              "description": "Display configuration",
              "isOptional": true,
              "name": "options",
              "type": "DisplaySurveyOptions"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "displaySurvey"
        },
        {
          "category": "Identification",
          "description": "Returns the current distinct ID for the user.",
          "details": "This is either the auto-generated ID or the ID set via `identify()`. The distinct ID is used to associate events with users in PostHog.",
          "examples": [
            {
              "code": "\n\n// get the current user ID\nconst userId = posthog.get_distinct_id()\nconsole.log('Current user:', userId)\n\n\n",
              "name": "get the current user ID",
              "id": "get_the_current_user_id"
            },
            {
              "code": "\n\n// use in loaded callback\nposthog.init('token', {\n    loaded: (posthog) => {\n        const id = posthog.get_distinct_id()\n        // use the ID\n    }\n})\n\n\n\n",
              "name": "use in loaded callback",
              "id": "use_in_loaded_callback"
            }
          ],
          "id": "get_distinct_id",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "string",
            "name": "string"
          },
          "title": "get_distinct_id"
        },
        {
          "category": "",
          "description": "Returns the explicit consent status of the user.",
          "details": "This can be used to check if the user has explicitly opted in or out of data capturing, or neither. This does not take the default config options into account, only whether the user has made an explicit choice, so this can be used to determine whether to show an initial cookie banner or not.",
          "examples": [
            {
              "code": "\n\nconst consentStatus = posthog.get_explicit_consent_status()\nif (consentStatus === \"granted\") {\n    // user has explicitly opted in\n} else if (consentStatus === \"denied\") {\n    // user has explicitly opted out\n} else if (consentStatus === \"pending\"){\n    // user has not made a choice, show consent banner\n}\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "get_explicit_consent_status",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "'granted' | 'denied' | 'pending'",
            "name": "'granted' | 'denied' | 'pending'"
          },
          "title": "get_explicit_consent_status"
        },
        {
          "category": "Identification",
          "description": "Returns the value of a super property. Returns undefined if the property doesn't exist.",
          "details": "get_property() can only be called after the PostHog library has finished loading. init() has a loaded function available to handle this automatically.",
          "examples": [
            {
              "code": "\n\n// grab value for '$user_id' after the posthog library has loaded\nposthog.init('<YOUR PROJECT TOKEN>', {\n    loaded: function(posthog) {\n        user_id = posthog.get_property('$user_id');\n    }\n});\n\n\n\n",
              "name": "grab value for '$user_id' after the posthog library has loaded",
              "id": "grab_value_for_'$user_id'_after_the_posthog_library_has_loaded"
            }
          ],
          "id": "get_property",
          "params": [
            {
              "description": "The name of the super property you want to retrieve",
              "isOptional": false,
              "name": "property_name",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "Property | undefined",
            "name": "Property | undefined"
          },
          "title": "get_property"
        },
        {
          "category": "",
          "description": "Returns the current session_id.",
          "details": "This should only be used for informative purposes. Any actual internal use case for the session_id should be handled by the sessionManager.",
          "examples": [
            {
              "code": "// Generated example for get_session_id\nposthog.get_session_id();",
              "name": "Generated example for get_session_id",
              "id": "get_session_id"
            }
          ],
          "id": "get_session_id",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "string",
            "name": "string"
          },
          "title": "get_session_id"
        },
        {
          "category": "Session replay",
          "description": "Returns the Replay url for the current session.",
          "details": null,
          "examples": [
            {
              "code": "\n\n// basic usage\nposthog.get_session_replay_url()\n\n@example\n\njs // timestamp posthog.get_session_replay_url({ withTimestamp: true })\n\n\n@example\n\njs // timestamp and lookback posthog.get_session_replay_url({ withTimestamp: true, timestampLookBack: 30 // look back 30 seconds }) ```\n\n\n\n",
              "name": "basic usage",
              "id": "basic_usage"
            }
          ],
          "id": "get_session_replay_url",
          "params": [
            {
              "description": "Options for the url",
              "isOptional": true,
              "name": "options",
              "type": "{\n        withTimestamp?: boolean;\n        timestampLookBack?: number;\n    }"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "string",
            "name": "string"
          },
          "title": "get_session_replay_url"
        },
        {
          "category": "Surveys",
          "description": "Get surveys that should be enabled for the current user. See [fetching surveys documentation](/docs/surveys/implementing-custom-surveys#fetching-surveys-manually) for more details.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.getActiveMatchingSurveys((surveys) => {\n     // do something\n})\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "getActiveMatchingSurveys",
          "params": [
            {
              "description": "The callback function will be called when the surveys are loaded or updated.",
              "isOptional": false,
              "name": "callback",
              "type": "SurveyCallback"
            },
            {
              "description": "Whether to force a reload of the surveys.",
              "isOptional": true,
              "name": "forceReload",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "getActiveMatchingSurveys"
        },
        {
          "category": "Feature flags",
          "description": "Get the list of early access features. To check enrollment status, use `isFeatureEnabled`. [Learn more in the docs](/docs/feature-flags/early-access-feature-management#option-2-custom-implementation)",
          "details": null,
          "examples": [
            {
              "code": "\n\nconst posthog = usePostHog()\nconst activeFlags = useActiveFeatureFlags()\n\nconst [activeBetas, setActiveBetas] = useState([])\nconst [inactiveBetas, setInactiveBetas] = useState([])\nconst [comingSoonFeatures, setComingSoonFeatures] = useState([])\n\nuseEffect(() => {\n  posthog.getEarlyAccessFeatures((features) => {\n    // Filter features by stage\n    const betaFeatures = features.filter(feature => feature.stage === 'beta')\n    const conceptFeatures = features.filter(feature => feature.stage === 'concept')\n\n    setComingSoonFeatures(conceptFeatures)\n\n    if (!activeFlags || activeFlags.length === 0) {\n      setInactiveBetas(betaFeatures)\n      return\n    }\n\n    const activeBetas = betaFeatures.filter(\n            beta => activeFlags.includes(beta.flagKey)\n        );\n    const inactiveBetas = betaFeatures.filter(\n            beta => !activeFlags.includes(beta.flagKey)\n        );\n    setActiveBetas(activeBetas)\n    setInactiveBetas(inactiveBetas)\n  }, true, ['concept', 'beta'])\n}, [activeFlags])\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "getEarlyAccessFeatures",
          "params": [
            {
              "description": "The callback function will be called when the early access features are loaded.",
              "isOptional": false,
              "name": "callback",
              "type": "EarlyAccessFeatureCallback"
            },
            {
              "description": "Whether to force a reload of the early access features.",
              "isOptional": true,
              "name": "force_reload",
              "type": "boolean"
            },
            {
              "description": "The stages of the early access features to load.",
              "isOptional": true,
              "name": "stages",
              "type": "EarlyAccessFeatureStage[]"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "getEarlyAccessFeatures"
        },
        {
          "category": "Feature flags",
          "description": "Gets the value of a feature flag for the current user.",
          "details": "Returns the feature flag value which can be a boolean, string, or undefined. Supports multivariate flags that can return custom string values.",
          "examples": [
            {
              "code": "\n\n// check boolean flag\nif (posthog.getFeatureFlag('new-feature')) {\n    // show new feature\n}\n\n\n",
              "name": "check boolean flag",
              "id": "check_boolean_flag"
            },
            {
              "code": "\n\n// check multivariate flag\nconst variant = posthog.getFeatureFlag('button-color')\nif (variant === 'red') {\n    // show red button\n}\n\n\n\n",
              "name": "check multivariate flag",
              "id": "check_multivariate_flag"
            }
          ],
          "id": "getFeatureFlag",
          "params": [
            {
              "description": "",
              "isOptional": false,
              "name": "key",
              "type": "string"
            },
            {
              "description": "(optional) If send_event: false, we won't send an $feature_flag_call event to PostHog.",
              "isOptional": true,
              "name": "options",
              "type": "{\n        send_event?: boolean;\n    }"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean | string | undefined",
            "name": "boolean | string | undefined"
          },
          "title": "getFeatureFlag"
        },
        {
          "category": "Feature flags",
          "description": "Get feature flag payload value matching key for user (supports multivariate flags).",
          "details": null,
          "examples": [
            {
              "code": "\n\nif(posthog.getFeatureFlag('beta-feature') === 'some-value') {\n     const someValue = posthog.getFeatureFlagPayload('beta-feature')\n     // do something\n}\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "getFeatureFlagPayload",
          "params": [
            {
              "description": "",
              "isOptional": false,
              "name": "key",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "JsonType",
            "name": "JsonType"
          },
          "title": "getFeatureFlagPayload"
        },
        {
          "category": "Identification",
          "description": "Returns the current groups.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for getGroups\nposthog.getGroups();",
              "name": "Generated example for getGroups",
              "id": "getgroups"
            }
          ],
          "id": "getGroups",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "Record<string, any>",
            "name": "Record<string, any>"
          },
          "title": "getGroups"
        },
        {
          "category": "Initialization",
          "description": "Returns the current page view ID.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for getPageViewId\nposthog.getPageViewId();",
              "name": "Generated example for getPageViewId",
              "id": "getpageviewid"
            }
          ],
          "id": "getPageViewId",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "string | undefined",
            "name": "string | undefined"
          },
          "title": "getPageViewId"
        },
        {
          "category": "Identification",
          "description": "Returns the value of the session super property named property_name. If no such property is set, getSessionProperty() will return the undefined value.",
          "details": "This is based on browser-level `sessionStorage`, NOT the PostHog session. getSessionProperty() can only be called after the PostHog library has finished loading. init() has a loaded function available to handle this automatically.",
          "examples": [
            {
              "code": "\n\n// grab value for 'user_id' after the posthog library has loaded\nposthog.init('YOUR PROJECT TOKEN', {\n    loaded: function(posthog) {\n        user_id = posthog.getSessionProperty('user_id');\n    }\n});\n\n\n",
              "name": "grab value for 'user_id' after the posthog library has loaded",
              "id": "grab_value_for_'user_id'_after_the_posthog_library_has_loaded"
            }
          ],
          "id": "getSessionProperty",
          "params": [
            {
              "description": "The name of the session super property you want to retrieve",
              "isOptional": false,
              "name": "property_name",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "Property | undefined",
            "name": "Property | undefined"
          },
          "title": "getSessionProperty"
        },
        {
          "category": "Surveys",
          "description": "Get list of all surveys.",
          "details": null,
          "examples": [
            {
              "code": "\n\nfunction callback(surveys, context) {\n  // do something\n}\n\nposthog.getSurveys(callback, false)\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "getSurveys",
          "params": [
            {
              "description": "Function that receives the array of surveys",
              "isOptional": false,
              "name": "callback",
              "type": "SurveyCallback"
            },
            {
              "description": "Optional boolean to force an API call for updated surveys",
              "isOptional": true,
              "name": "forceReload",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "getSurveys"
        },
        {
          "category": "Identification",
          "description": "Associates the user with a group for group-based analytics. Learn more about [groups](/docs/product-analytics/group-analytics)",
          "details": "Groups allow you to analyze users collectively (e.g., by organization, team, or account). This sets the group association for all subsequent events and reloads feature flags.",
          "examples": [
            {
              "code": "\n\n// associate user with an organization\nposthog.group('organization', 'org_12345', {\n    name: 'Acme Corp',\n    plan: 'enterprise'\n})\n\n\n",
              "name": "associate user with an organization",
              "id": "associate_user_with_an_organization"
            },
            {
              "code": "\n\n// associate with multiple group types\nposthog.group('organization', 'org_12345')\nposthog.group('team', 'team_67890')\n\n\n\n",
              "name": "associate with multiple group types",
              "id": "associate_with_multiple_group_types"
            }
          ],
          "id": "group",
          "params": [
            {
              "description": "Group type (example: 'organization')",
              "isOptional": false,
              "name": "groupType",
              "type": "string"
            },
            {
              "description": "Group key (example: 'org::5')",
              "isOptional": false,
              "name": "groupKey",
              "type": "string"
            },
            {
              "description": "Optional properties to set for group",
              "isOptional": true,
              "name": "groupPropertiesToSet",
              "type": "Properties"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "group"
        },
        {
          "category": "Privacy",
          "description": "Checks if the user has opted into data capturing.",
          "details": "Returns the current consent status for event tracking and data persistence.",
          "examples": [
            {
              "code": "\n\nif (posthog.has_opted_in_capturing()) {\n    // show analytics features\n}\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "has_opted_in_capturing",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean",
            "name": "boolean"
          },
          "title": "has_opted_in_capturing"
        },
        {
          "category": "Privacy",
          "description": "Checks if the user has opted out of data capturing.",
          "details": "Returns the current consent status for event tracking and data persistence.",
          "examples": [
            {
              "code": "\n\nif (posthog.has_opted_out_capturing()) {\n    // disable analytics features\n}\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "has_opted_out_capturing",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean",
            "name": "boolean"
          },
          "title": "has_opted_out_capturing"
        },
        {
          "category": "Identification",
          "description": "Associates a user with a unique identifier instead of an auto-generated ID. Learn more about [identifying users](/docs/product-analytics/identify)",
          "details": "By default, PostHog assigns each user a randomly generated `distinct_id`. Use this method to replace that ID with your own unique identifier (like a user ID from your database).",
          "examples": [
            {
              "code": "\n\n// basic identification\nposthog.identify('user_12345')\n\n\n",
              "name": "basic identification",
              "id": "basic_identification"
            },
            {
              "code": "\n\n// identify with user properties\nposthog.identify('user_12345', {\n    email: 'user@example.com',\n    plan: 'premium'\n})\n\n\n",
              "name": "identify with user properties",
              "id": "identify_with_user_properties"
            },
            {
              "code": "\n\n// identify with set and set_once properties\nposthog.identify('user_12345',\n    { last_login: new Date() },  // updates every time\n    { signup_date: new Date() }  // sets only once\n)\n\n\n\n",
              "name": "identify with set and set_once properties",
              "id": "identify_with_set_and_set_once_properties"
            }
          ],
          "id": "identify",
          "params": [
            {
              "description": "A string that uniquely identifies a user. If not provided, the distinct_id currently in the persistent store (cookie or localStorage) will be used.",
              "isOptional": true,
              "name": "new_distinct_id",
              "type": "string"
            },
            {
              "description": "Optional: An associative array of properties to store about the user. Note: For feature flag evaluations, if the same key is present in the userPropertiesToSetOnce, it will be overwritten by the value in userPropertiesToSet.",
              "isOptional": true,
              "name": "userPropertiesToSet",
              "type": "Properties"
            },
            {
              "description": "Optional: An associative array of properties to store about the user. If property is previously set, this does not override that value.",
              "isOptional": true,
              "name": "userPropertiesToSetOnce",
              "type": "Properties"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "identify"
        },
        {
          "category": "Initialization",
          "description": "Initializes a new instance of the PostHog capturing object.",
          "details": "All new instances are added to the main posthog object as sub properties (such as `posthog.library_name`) and also returned by this function. [Learn more about configuration options](https://github.com/posthog/posthog-js/blob/6e0e873/src/posthog-core.js#L57-L91)",
          "examples": [
            {
              "code": "\n\n// basic initialization\nposthog.init('<ph_project_api_key>', {\n    api_host: '<ph_client_api_host>'\n})\n\n\n",
              "name": "basic initialization",
              "id": "basic_initialization"
            },
            {
              "code": "\n\n// multiple instances\nposthog.init('<ph_project_api_key>', {}, 'project1')\nposthog.init('<ph_project_api_key>', {}, 'project2')\n\n\n\n",
              "name": "multiple instances",
              "id": "multiple_instances"
            }
          ],
          "id": "init",
          "params": [
            {
              "description": "Your PostHog API token",
              "isOptional": false,
              "name": "token",
              "type": "string"
            },
            {
              "description": "A dictionary of config options to override",
              "isOptional": true,
              "name": "config",
              "type": "OnlyValidKeys<Partial<PostHogConfig>, Partial<PostHogConfig>>"
            },
            {
              "description": "The name for the new posthog instance that you want created",
              "isOptional": true,
              "name": "name",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "PostHog",
            "name": "PostHog"
          },
          "title": "init"
        },
        {
          "category": "Privacy",
          "description": "Checks whether the PostHog library is currently capturing events.\nUsually this means that the user has not opted out of capturing, but the exact behaviour can be controlled by some config options.\nAdditionally, if the cookieless_mode is set to 'on_reject', we will capture events in cookieless mode if the user has explicitly opted out.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for is_capturing\nposthog.is_capturing();",
              "name": "Generated example for is_capturing",
              "id": "is_capturing"
            }
          ],
          "id": "is_capturing",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean",
            "name": "boolean"
          },
          "title": "is_capturing"
        },
        {
          "category": "Feature flags",
          "description": "Checks if a feature flag is enabled for the current user.",
          "details": "Returns true if the flag is enabled, false if disabled, or undefined if not found. This is a convenience method that treats any truthy value as enabled.",
          "examples": [
            {
              "code": "\n\n// simple feature flag check\nif (posthog.isFeatureEnabled('new-checkout')) {\n    showNewCheckout()\n}\n\n\n",
              "name": "simple feature flag check",
              "id": "simple_feature_flag_check"
            },
            {
              "code": "\n\n// disable event tracking\nif (posthog.isFeatureEnabled('feature', { send_event: false })) {\n    // flag checked without sending $feature_flag_call event\n}\n\n\n\n",
              "name": "disable event tracking",
              "id": "disable_event_tracking"
            }
          ],
          "id": "isFeatureEnabled",
          "params": [
            {
              "description": "",
              "isOptional": false,
              "name": "key",
              "type": "string"
            },
            {
              "description": "(optional) If send_event: false, we won't send an $feature_flag_call event to PostHog.",
              "isOptional": true,
              "name": "options",
              "type": "{\n        send_event: boolean;\n    }"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean | undefined",
            "name": "boolean | undefined"
          },
          "title": "isFeatureEnabled"
        },
        {
          "category": "Toolbar",
          "description": "returns a boolean indicating whether the [toolbar](/docs/toolbar) loaded",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for loadToolbar\nposthog.loadToolbar();",
              "name": "Generated example for loadToolbar",
              "id": "loadtoolbar"
            }
          ],
          "id": "loadToolbar",
          "params": [
            {
              "description": "",
              "isOptional": false,
              "name": "params",
              "type": "ToolbarParams"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean",
            "name": "boolean"
          },
          "title": "loadToolbar"
        },
        {
          "category": "Capture",
          "description": "Exposes a set of events that PostHog will emit. e.g. `eventCaptured` is emitted immediately before trying to send an event\nUnlike `onFeatureFlags` and `onSessionId` these are not called when the listener is registered, the first callback will be the next event _after_ registering a listener",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.on('eventCaptured', (event) => {\n  console.log(event)\n})\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "on",
          "params": [
            {
              "description": "The event to listen for.",
              "isOptional": false,
              "name": "event",
              "type": "'eventCaptured'"
            },
            {
              "description": "The callback function to call when the event is emitted.",
              "isOptional": false,
              "name": "cb",
              "type": "(...args: any[]) => void"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "() => void",
            "name": "() => void"
          },
          "title": "on"
        },
        {
          "category": "Feature flags",
          "description": "Register an event listener that runs when feature flags become available or when they change. If there are flags, the listener is called immediately in addition to being called on future changes. Note that this is not called only when we fetch feature flags from the server, but also when they change in the browser.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.onFeatureFlags(function(featureFlags, featureFlagsVariants, { errorsLoading }) {\n    // do something\n})\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "onFeatureFlags",
          "params": [
            {
              "description": "The callback function will be called once the feature flags are ready or when they are updated. It'll return a list of feature flags enabled for the user, the variants, and also a context object indicating whether we succeeded to fetch the flags or not.",
              "isOptional": false,
              "name": "callback",
              "type": "FeatureFlagsCallback"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "() => void",
            "name": "() => void"
          },
          "title": "onFeatureFlags"
        },
        {
          "category": "Identification",
          "description": "Register an event listener that runs whenever the session id or window id change. If there is already a session id, the listener is called immediately in addition to being called on future changes.\nCan be used, for example, to sync the PostHog session id with a backend session.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.onSessionId(function(sessionId, windowId) { // do something })\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "onSessionId",
          "params": [
            {
              "description": "The callback function will be called once a session id is present or when it or the window id are updated.",
              "isOptional": false,
              "name": "callback",
              "type": "SessionIdChangedCallback"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "() => void",
            "name": "() => void"
          },
          "title": "onSessionId"
        },
        {
          "category": "Surveys",
          "description": "Register an event listener that runs when surveys are loaded.\nCallback parameters: - surveys: Survey[]: An array containing all survey objects fetched from PostHog using the getSurveys method - context:  isLoaded: boolean, error?: string : An object indicating if the surveys were loaded successfully",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.onSurveysLoaded((surveys, context) => { // do something })\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "onSurveysLoaded",
          "params": [
            {
              "description": "The callback function will be called when surveys are loaded or updated.",
              "isOptional": false,
              "name": "callback",
              "type": "SurveyCallback"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "() => void",
            "name": "() => void"
          },
          "title": "onSurveysLoaded"
        },
        {
          "category": "Privacy",
          "description": "Opts the user into data capturing and persistence.",
          "details": "Enables event tracking and data persistence (cookies/localStorage) for this PostHog instance. By default, captures an `$opt_in` event unless disabled.",
          "examples": [
            {
              "code": "\n\n// simple opt-in\nposthog.opt_in_capturing()\n\n\n",
              "name": "simple opt-in",
              "id": "simple_opt-in"
            },
            {
              "code": "\n\n// opt-in with custom event and properties\nposthog.opt_in_capturing({\n    captureEventName: 'Privacy Accepted',\n    captureProperties: { source: 'banner' }\n})\n\n\n",
              "name": "opt-in with custom event and properties",
              "id": "opt-in_with_custom_event_and_properties"
            },
            {
              "code": "\n\n// opt-in without capturing event\nposthog.opt_in_capturing({\n    captureEventName: false\n})\n\n\n\n",
              "name": "opt-in without capturing event",
              "id": "opt-in_without_capturing_event"
            }
          ],
          "id": "opt_in_capturing",
          "params": [
            {
              "description": "",
              "isOptional": true,
              "name": "options",
              "type": "{\n        captureEventName?: EventName | null | false; /** event name to be used for capturing the opt-in action */\n        captureProperties?: Properties; /** set of properties to be captured along with the opt-in action */\n    }"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "opt_in_capturing"
        },
        {
          "category": "Privacy",
          "description": "Opts the user out of data capturing and persistence.",
          "details": "Disables event tracking and data persistence (cookies/localStorage) for this PostHog instance. If `opt_out_persistence_by_default` is true, SDK persistence will also be disabled.",
          "examples": [
            {
              "code": "\n\n// opt user out (e.g., on privacy settings page)\nposthog.opt_out_capturing()\n\n\n\n",
              "name": "opt user out (e.g., on privacy settings page)",
              "id": "opt_user_out_(e.g.,_on_privacy_settings_page)"
            }
          ],
          "id": "opt_out_capturing",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "opt_out_capturing"
        },
        {
          "category": "",
          "description": "push() keeps the standard async-array-push behavior around after the lib is loaded. This is only useful for external integrations that do not wish to rely on our convenience methods (created in the snippet).",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.push(['register', { a: 'b' }]);\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "push",
          "params": [
            {
              "description": "A [function_name, args...] array to be executed",
              "isOptional": false,
              "name": "item",
              "type": "SnippetArrayItem"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "push"
        },
        {
          "category": "Capture",
          "description": "Registers super properties for the current session only.",
          "details": "Session super properties are automatically added to all events during the current browser session. Unlike regular super properties, these are cleared when the session ends and are stored in sessionStorage.",
          "examples": [
            {
              "code": "\n\n// register session-specific properties\nposthog.register_for_session({\n    current_page_type: 'checkout',\n    ab_test_variant: 'control'\n})\n\n\n",
              "name": "register session-specific properties",
              "id": "register_session-specific_properties"
            },
            {
              "code": "\n\n// register properties for user flow tracking\nposthog.register_for_session({\n    selected_plan: 'pro',\n    completed_steps: 3,\n    flow_id: 'signup_flow_v2'\n})\n\n\n\n",
              "name": "register properties for user flow tracking",
              "id": "register_properties_for_user_flow_tracking"
            }
          ],
          "id": "register_for_session",
          "params": [
            {
              "description": "An associative array of properties to store about the user",
              "isOptional": false,
              "name": "properties",
              "type": "Properties"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "register_for_session"
        },
        {
          "category": "Capture",
          "description": "Registers super properties only if they haven't been set before.",
          "details": "Unlike `register()`, this method will not overwrite existing super properties. Use this for properties that should only be set once, like signup date or initial referrer.",
          "examples": [
            {
              "code": "\n\n// register once-only properties\nposthog.register_once({\n    first_login_date: new Date().toISOString(),\n    initial_referrer: document.referrer\n})\n\n\n",
              "name": "register once-only properties",
              "id": "register_once-only_properties"
            },
            {
              "code": "\n\n// override existing value if it matches default\nposthog.register_once(\n    { user_type: 'premium' },\n    'unknown'  // overwrite if current value is 'unknown'\n)\n\n\n\n",
              "name": "override existing value if it matches default",
              "id": "override_existing_value_if_it_matches_default"
            }
          ],
          "id": "register_once",
          "params": [
            {
              "description": "An associative array of properties to store about the user",
              "isOptional": false,
              "name": "properties",
              "type": "Properties"
            },
            {
              "description": "Value to override if already set in super properties (ex: 'False') Default: 'None'",
              "isOptional": true,
              "name": "default_value",
              "type": "Property"
            },
            {
              "description": "How many days since the users last visit to store the super properties",
              "isOptional": true,
              "name": "days",
              "type": "number"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "register_once"
        },
        {
          "category": "Capture",
          "description": "Registers super properties that are included with all events.",
          "details": "Super properties are stored in persistence and automatically added to every event you capture. These values will overwrite any existing super properties with the same keys.",
          "examples": [
            {
              "code": "\n\n// register a single property\nposthog.register({ plan: 'premium' })\n\n\n\n\n",
              "name": "register a single property",
              "id": "register_a_single_property"
            },
            {
              "code": "\n\n// register multiple properties\nposthog.register({\n    email: 'user@example.com',\n    account_type: 'business',\n    signup_date: '2023-01-15'\n})\n\n\n",
              "name": "register multiple properties",
              "id": "register_multiple_properties"
            },
            {
              "code": "\n\n// register with custom expiration\nposthog.register({ campaign: 'summer_sale' }, 7) // expires in 7 days\n\n\n\n",
              "name": "register with custom expiration",
              "id": "register_with_custom_expiration"
            }
          ],
          "id": "register",
          "params": [
            {
              "description": "properties to store about the user",
              "isOptional": false,
              "name": "properties",
              "type": "Properties"
            },
            {
              "description": "How many days since the user's last visit to store the super properties",
              "isOptional": true,
              "name": "days",
              "type": "number"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "register"
        },
        {
          "category": "Feature flags",
          "description": "Feature flag values are cached. If something has changed with your user and you'd like to refetch their flag values, call this method.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.reloadFeatureFlags()\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "reloadFeatureFlags",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "reloadFeatureFlags"
        },
        {
          "category": "Surveys",
          "description": "Although we recommend using popover surveys and display conditions, if you want to show surveys programmatically without setting up all the extra logic needed for API surveys, you can render surveys programmatically with the renderSurvey method.\nThis takes a survey ID and an HTML selector to render an unstyled survey.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.renderSurvey(coolSurveyID, '#survey-container')\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "renderSurvey",
          "params": [
            {
              "description": "The ID of the survey to render.",
              "isOptional": false,
              "name": "surveyId",
              "type": "string"
            },
            {
              "description": "The selector of the HTML element to render the survey on.",
              "isOptional": false,
              "name": "selector",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "deprecated",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "renderSurvey"
        },
        {
          "category": "Identification",
          "description": "Resets all user data and starts a fresh session.\n⚠️ **Warning**: Only call this when a user logs out. Calling at the wrong time can cause split sessions.\nThis clears: - Session ID and super properties - User identification (sets new random distinct_id) - Cached data and consent settings",
          "details": null,
          "examples": [
            {
              "code": "\n\n// reset on user logout\nfunction logout() {\n    posthog.reset()\n    // redirect to login page\n}\n\n\n",
              "name": "reset on user logout",
              "id": "reset_on_user_logout"
            },
            {
              "code": "\n\n// reset and generate new device ID\nposthog.reset(true)  // also resets device_id\n\n\n\n",
              "name": "reset and generate new device ID",
              "id": "reset_and_generate_new_device_id"
            }
          ],
          "id": "reset",
          "params": [
            {
              "description": "",
              "isOptional": true,
              "name": "reset_device_id",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "reset"
        },
        {
          "category": "Feature flags",
          "description": "Resets the group properties for feature flags.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.resetGroupPropertiesForFlags()\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "resetGroupPropertiesForFlags",
          "params": [
            {
              "description": "",
              "isOptional": true,
              "name": "group_type",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "resetGroupPropertiesForFlags"
        },
        {
          "category": "Identification",
          "description": "Resets only the group properties of the user currently logged in. Learn more about [groups](/docs/product-analytics/group-analytics)",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.resetGroups()\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "resetGroups",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "resetGroups"
        },
        {
          "category": "Feature flags",
          "description": "Resets the person properties for feature flags.",
          "details": null,
          "examples": [
            {
              "code": "\n\nposthog.resetPersonPropertiesForFlags()\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "resetPersonPropertiesForFlags",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "resetPersonPropertiesForFlags"
        },
        {
          "category": "Session replay",
          "description": "returns a boolean indicating whether session recording is currently running",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Stop session recording if it's running\nif (posthog.sessionRecordingStarted()) {\n  posthog.stopSessionRecording()\n}\n\n\n\n",
              "name": "Stop session recording if it's running",
              "id": "stop_session_recording_if_it's_running"
            }
          ],
          "id": "sessionRecordingStarted",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "boolean",
            "name": "boolean"
          },
          "title": "sessionRecordingStarted"
        },
        {
          "category": "Initialization",
          "description": "Updates the configuration of the PostHog instance.",
          "details": null,
          "examples": [
            {
              "code": "// Generated example for set_config\nposthog.set_config();",
              "name": "Generated example for set_config",
              "id": "set_config"
            }
          ],
          "id": "set_config",
          "params": [
            {
              "description": "A dictionary of new configuration values to update",
              "isOptional": false,
              "name": "config",
              "type": "Partial<PostHogConfig>"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "set_config"
        },
        {
          "category": "Feature flags",
          "description": "Set override group properties for feature flags. This is used when dealing with new groups / where you don't want to wait for ingestion to update properties. Takes in an object, the key of which is the group type.",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Set properties with reload\nposthog.setGroupPropertiesForFlags({'organization': { name: 'CYZ', employees: '11' } })\n\n\n",
              "name": "Set properties with reload",
              "id": "set_properties_with_reload"
            },
            {
              "code": "\n\n// Set properties without reload\nposthog.setGroupPropertiesForFlags({'organization': { name: 'CYZ', employees: '11' } }, false)\n\n\n\n",
              "name": "Set properties without reload",
              "id": "set_properties_without_reload"
            }
          ],
          "id": "setGroupPropertiesForFlags",
          "params": [
            {
              "description": "The properties to override, the key of which is the group type.",
              "isOptional": false,
              "name": "properties",
              "type": "{\n        [type: string]: Properties;\n    }"
            },
            {
              "description": "Whether to reload feature flags.",
              "isOptional": true,
              "name": "reloadFeatureFlags",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "setGroupPropertiesForFlags"
        },
        {
          "category": "Identification",
          "description": "Sets properties on the person profile associated with the current `distinct_id`. Learn more about [identifying users](/docs/product-analytics/identify)",
          "details": "Updates user properties that are stored with the person profile in PostHog. If `person_profiles` is set to `identified_only` and no profile exists, this will create one.",
          "examples": [
            {
              "code": "\n\n// set user properties\nposthog.setPersonProperties({\n    email: 'user@example.com',\n    plan: 'premium'\n})\n\n\n",
              "name": "set user properties",
              "id": "set_user_properties"
            },
            {
              "code": "\n\n// set properties\nposthog.setPersonProperties(\n    { name: 'Max Hedgehog' },  // $set properties\n    { initial_url: '/blog' }   // $set_once properties\n)\n\n\n\n",
              "name": "set properties",
              "id": "set_properties"
            }
          ],
          "id": "setPersonProperties",
          "params": [
            {
              "description": "Optional: An associative array of properties to store about the user. Note: For feature flag evaluations, if the same key is present in the userPropertiesToSetOnce, it will be overwritten by the value in userPropertiesToSet.",
              "isOptional": true,
              "name": "userPropertiesToSet",
              "type": "Properties"
            },
            {
              "description": "Optional: An associative array of properties to store about the user. If property is previously set, this does not override that value.",
              "isOptional": true,
              "name": "userPropertiesToSetOnce",
              "type": "Properties"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "setPersonProperties"
        },
        {
          "category": "Feature flags",
          "description": "Sometimes, you might want to evaluate feature flags using properties that haven't been ingested yet, or were set incorrectly earlier. You can do so by setting properties the flag depends on with these calls:",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Set properties\nposthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'})\n\n\n",
              "name": "Set properties",
              "id": "set_properties"
            },
            {
              "code": "\n\n// Set properties without reloading\nposthog.setPersonPropertiesForFlags({'property1': 'value', property2: 'value2'}, false)\n\n\n\n",
              "name": "Set properties without reloading",
              "id": "set_properties_without_reloading"
            }
          ],
          "id": "setPersonPropertiesForFlags",
          "params": [
            {
              "description": "The properties to override.",
              "isOptional": false,
              "name": "properties",
              "type": "Properties"
            },
            {
              "description": "Whether to reload feature flags.",
              "isOptional": true,
              "name": "reloadFeatureFlags",
              "type": "boolean"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "setPersonPropertiesForFlags"
        },
        {
          "category": "Session replay",
          "description": "turns session recording on, and updates the config option `disable_session_recording` to false",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Start and ignore controls\nposthog.startSessionRecording(true)\n\n\n",
              "name": "Start and ignore controls",
              "id": "start_and_ignore_controls"
            },
            {
              "code": "\n\n// Start and override controls\nposthog.startSessionRecording({\n  // you don't have to send all of these\n  sampling: true || false,\n  linked_flag: true || false,\n  url_trigger: true || false,\n  event_trigger: true || false\n})\n\n\n\n",
              "name": "Start and override controls",
              "id": "start_and_override_controls"
            }
          ],
          "id": "startSessionRecording",
          "params": [
            {
              "description": "optional boolean to override the default sampling behavior - ensures the next session recording to start will not be skipped by sampling or linked_flag config. `true` is shorthand for  sampling: true, linked_flag: true",
              "isOptional": true,
              "name": "override",
              "type": "{\n        sampling?: boolean;\n        linked_flag?: boolean;\n        url_trigger?: true;\n        event_trigger?: true;\n    } | true"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "startSessionRecording"
        },
        {
          "category": "Session replay",
          "description": "turns session recording off, and updates the config option disable_session_recording to true",
          "details": null,
          "examples": [
            {
              "code": "\n\n// Stop session recording\nposthog.stopSessionRecording()\n\n\n\n",
              "name": "Stop session recording",
              "id": "stop_session_recording"
            }
          ],
          "id": "stopSessionRecording",
          "params": [],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "stopSessionRecording"
        },
        {
          "category": "Capture",
          "description": "Removes a session super property from the current session.",
          "details": "This will stop the property from being automatically included in future events for this session. The property is removed from sessionStorage.",
          "examples": [
            {
              "code": "\n\n// remove a session property\nposthog.unregister_for_session('current_flow')\n\n\n\n",
              "name": "remove a session property",
              "id": "remove_a_session_property"
            }
          ],
          "id": "unregister_for_session",
          "params": [
            {
              "description": "The name of the session super property to remove",
              "isOptional": false,
              "name": "property",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "unregister_for_session"
        },
        {
          "category": "Capture",
          "description": "Removes a super property from persistent storage.",
          "details": "This will stop the property from being automatically included in future events. The property will be permanently removed from the user's profile.",
          "examples": [
            {
              "code": "\n\n// remove a super property\nposthog.unregister('plan_type')\n\n\n\n",
              "name": "remove a super property",
              "id": "remove_a_super_property"
            }
          ],
          "id": "unregister",
          "params": [
            {
              "description": "The name of the super property to remove",
              "isOptional": false,
              "name": "property",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "unregister"
        },
        {
          "category": "Feature flags",
          "description": "Opt the user in or out of an early access feature. [Learn more in the docs](/docs/feature-flags/early-access-feature-management#option-2-custom-implementation)",
          "details": null,
          "examples": [
            {
              "code": "\n\nconst toggleBeta = (betaKey) => {\n  if (activeBetas.some(\n    beta => beta.flagKey === betaKey\n  )) {\n    posthog.updateEarlyAccessFeatureEnrollment(\n      betaKey,\n      false\n    )\n    setActiveBetas(\n      prevActiveBetas => prevActiveBetas.filter(\n        item => item.flagKey !== betaKey\n      )\n    );\n    return\n  }\n\n  posthog.updateEarlyAccessFeatureEnrollment(\n    betaKey,\n    true\n  )\n  setInactiveBetas(\n    prevInactiveBetas => prevInactiveBetas.filter(\n      item => item.flagKey !== betaKey\n    )\n  );\n}\n\nconst registerInterest = (featureKey) => {\n  posthog.updateEarlyAccessFeatureEnrollment(\n    featureKey,\n    true\n  )\n  // Update UI to show user has registered\n}\n\n\n\n",
              "name": "",
              "id": ""
            }
          ],
          "id": "updateEarlyAccessFeatureEnrollment",
          "params": [
            {
              "description": "The key of the feature flag to update.",
              "isOptional": false,
              "name": "key",
              "type": "string"
            },
            {
              "description": "Whether the user is enrolled in the feature.",
              "isOptional": false,
              "name": "isEnrolled",
              "type": "boolean"
            },
            {
              "description": "The stage of the feature flag to update.",
              "isOptional": true,
              "name": "stage",
              "type": "string"
            }
          ],
          "path": "lib/src/posthog-core.d.ts",
          "releaseTag": "public",
          "showDocs": true,
          "returnType": {
            "id": "void",
            "name": "void"
          },
          "title": "updateEarlyAccessFeatureEnrollment"
        }
      ],
      "id": "PostHog",
      "title": "PostHog"
    }
  ],
  "version": "latest"
}