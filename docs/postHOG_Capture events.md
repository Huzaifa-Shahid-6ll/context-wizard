# Capturing events

import Tab from "components/Tab"
Once your PostHog instance is up and running, the next step is to start sending events.

<!-- prettier-ignore -->
<Tab.Group tabs={[
    'Web', 
    'Node.js', 
    'Python', 
    'PHP', 
    'Ruby', 
    'Go', 
    'React', 
    'React Native', 
    'Android', 
    'iOS', 
    'Java', 
    'Rust', 
    'Elixir', 
    'Flutter', 
    '.NET', 
    'api']}>
    <Tab.List>
        <Tab>Web</Tab>
        <Tab>Node.js</Tab>
        <Tab>Python</Tab>
        <Tab>PHP</Tab>
        <Tab>Ruby</Tab>
        <Tab>Go</Tab>
        <Tab>React</Tab>
        <Tab>React Native</Tab>
        <Tab>Android</Tab>
        <Tab>iOS</Tab>
        <Tab>Java</Tab>
        <Tab>Rust</Tab>
        <Tab>Elixir</Tab>
        <Tab>Flutter</Tab>
        <Tab>.NET</Tab>
        <Tab>API</Tab>
    </Tab.List>
    <Tab.Panels>
        <Tab.Panel>
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
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```node
client.capture({
    distinctId: 'distinct_id_of_the_user',
    event: 'user signed up',
})    
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```node
client.capture({
  distinctId: 'distinct_id_of_the_user',
  event: 'user signed up',
  properties: {
    login_type: 'email',
    is_free_trial: true,
  },
})
```

### Capturing pageviews

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `$pageview` events from your backend like so:

```node
client.capture({
  distinctId: 'distinct_id_of_the_user',
  event: '$pageview',
  properties: {
    $current_url: 'https://example.com',
  },
})
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```python
# Events captured with no context or explicit distinct_id are marked as personless and have an auto-generated distinct_id:
posthog.capture('some-anon-event')

from posthog import identify_context, new_context

# Use contexts to manage user identification across multiple capture calls
with new_context():
    identify_context('distinct_id_of_the_user')
    posthog.capture('user_signed_up')
    posthog.capture('user_logged_in')
    # You can also capture events with a specific distinct_id
    posthog.capture('some-custom-action', distinct_id='distinct_id_of_the_user')

```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```python
posthog.capture(
    "user_signed_up",
    distinct_id="distinct_id_of_the_user",
    properties={
        "login_type": "email",
        "is_free_trial": "true"
    }
)
```

### Sending page views

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `pageviews` from your backend like so:

```python
posthog.capture('$pageview', distinct_id="distinct_id_of_the_user", properties={'$current_url': 'https://example.com'})
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```php
PostHog::capture(array(
  'distinctId' => 'distinct_id_of_the_user',
  'event' => 'user_signed_up'
));
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```php
PostHog::capture(array(
  'distinctId' => 'distinct_id_of_the_user',
  'event' => 'user_signed_up',
  'properties' => array(
    'login_type' => 'email',
    'is_free_trial' => 'true'
  )
));
```

### Sending page views

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `pageviews` from your backend like so:

```php
PostHog::capture(array(
  'distinctId' => 'distinct_id_of_the_user',
  'event' => '$pageview',
  'properties' => array(
    '$current_url' => 'https://example.com'
  )
));
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```ruby
posthog.capture({
    distinct_id: 'distinct_id_of_the_user',
    event: 'user_signed_up'
})
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```ruby
posthog.capture({
    distinct_id: 'distinct_id_of_the_user',
    event: 'user_signed_up',
    properties: {
        login_type: 'email',
        is_free_trial: true
    }
})
```

### Sending pageviews

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `pageviews` from your backend like so:

```ruby
posthog.capture({
    distinct_id: 'distinct_id_of_the_user',
    event: '$pageview',
    properties: {
        '$current_url': 'https://example.com'
    }
})
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```go
client.Enqueue(posthog.Capture{
  DistinctId: "distinct_id_of_the_user",
  Event: "user_signed_up",
})
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```go
  client.Enqueue(posthog.Capture{
    DistinctId: "distinct_id_of_the_user",
    Event:      "user_signed_up",
    Properties: posthog.NewProperties().
      Set("login_type", "email").
      Set("is_free_trial", true),
  })
```

### Capturing pageviews

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `pageviews` from your backend like so:

```go
client.Enqueue(posthog.Capture{
  DistinctId: "distinct_id_of_the_user",
  Event:      "$pageview",
  Properties: posthog.NewProperties().
    Set("$current_url", "https://example.com"),
})
```
        </Tab.Panel>
        <Tab.Panel>
            By default, PostHog automatically captures pageviews and pageleaves as well as clicks, change of inputs, and form submissions associated with `a`, `button`, `form`, `input`, `select`, `textarea`, and `label` tags. See our [autocapture docs](/docs/product-analytics/autocapture) for more details on this.

If you prefer to disable or filter these, set the appropriate values in your [configuration options](/docs/libraries/js/config).

## Capturing custom events

After setting up the PostHog provider, you can use the `usePostHog` hook to access all the methods of the `posthog-js` library including `capture` which lets you capture custom events with optional properties.

```js
import { usePostHog } from '@posthog/react'

function App() {
  const posthog = usePostHog()

  const signUpClicked = () => {
    posthog?.capture('clicked_sign_up', {
      signup_method: 'email'
    })
  }

  return (
    <div className="App">
      <button onClick={() => posthog?.capture('button_clicked')}>Click me</button>
      <button onClick={signUpClicked}>Sign up</button>
    </div>
  )
}

export default App
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```react-native
posthog.capture('user_signed_up')
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```react-native
posthog.capture('user_signed_up', {
    login_type: "email",
    is_free_trial: true
})
```

### Capturing screen views

#### With `@react-navigation/native` and autocapture:

When using [@react-navigation/native](https://reactnavigation.org/docs/6.x/getting-started) v6 or lower, screen tracking is automatically captured if the [`autocapture`](/docs/libraries/react-native#autocapture) property is used in the `PostHogProvider`:

It is important that the `PostHogProvider` is configured as a child of the `NavigationContainer`:

```react-native
// App.(js|ts)

import { PostHogProvider } from 'posthog-react-native'
import { NavigationContainer } from '@react-navigation/native'

export function App() {
    return (
        <NavigationContainer>
            <PostHogProvider apiKey="<ph_project_api_key>" autocapture>
                {/* Rest of app */}
            </PostHogProvider>
        </NavigationContainer>
    )
}
```

When using [@react-navigation/native](https://reactnavigation.org/docs/7.x/getting-started) v7 or higher, screen tracking has to be manually captured:

```react-native
// App.(js|ts)

import { PostHogProvider } from 'posthog-react-native'
import { NavigationContainer } from '@react-navigation/native'

// Using `PostHogProvider` is optional, but needed if you want to capture touch events automatically with the `captureTouches` option.
export function App() {
    return (
        <NavigationContainer>
            <PostHogProvider apiKey="<ph_project_api_key>" autocapture={{
              captureScreens: false, // Screen events are handled differently for v7 and higher
              captureTouches: true,
            }}>
                {/* Rest of app */}
            </PostHogProvider>
        </NavigationContainer>
    )
}
```

Check out and set it up the official way for [Screen tracking for analytics](https://reactnavigation.org/docs/screen-tracking/).

Then call the `screen` method within the `trackScreenView` method.

```react-native
const posthog = usePostHog() // use the usePostHog hook if using the PostHogProvider or your own custom posthog instance
// you can read the params from `getCurrentRoute()`
posthog.screen(currentRouteName, params)
```

#### With `react-native-navigation` and autocapture:

First, simplify the wrapping of your screens with a shared PostHogProvider:

```react-native
import PostHog, { PostHogProvider } from 'posthog-react-native'
import { Navigation } from 'react-native-navigation';

export const posthog = new PostHog('<ph_project_api_key>');

export const SharedPostHogProvider = (props: any) => {
  return (
    <PostHogProvider client={posthog} autocapture={{
      captureScreens: false, // Screen events are handled differently for react-native-navigation
      captureTouches: true,
    }}>
      {props.children}
    </PostHogProvider>
  );
};
```

Then, every screen needs to be wrapped with this provider if you want to capture touches or use the `usePostHog()` hook 

```react-native
export const MyScreen = () => {
  return (
    <SharedPostHogProvider>
      <View>
        ...
      </View>
    </SharedPostHogProvider>
  );
};

Navigation.registerComponent('Screen', () => MyScreen);

Navigation.events().registerAppLaunchedListener(async () => {
  posthog.initReactNativeNavigation({
    navigation: {
      // (Optional) Set the name based on the route. Defaults to the route name.
      routeToName: (name, properties) => name,
      // (Optional) Tracks all passProps as properties. Defaults to undefined
      routeToProperties: (name, properties) => properties,
    },
    captureScreens: true,
  });
});
```

#### With `expo-router`:

Check out and set it up the official way for [Screen tracking for analytics](https://docs.expo.dev/router/reference/screen-tracking/).

Then call the `screen` method within the `useEffect` callback.

```react-native
const posthog = usePostHog() // use the usePostHog hook if using the PostHogProvider or your own custom posthog instance
posthog.screen(pathname, params)
```

#### Manually capturing screen capture events

If you prefer not to use autocapture, you can manually capture screen views by calling `posthog.screen()`. This function requires a `name`. You may also pass in an optional `properties` object.

```javascript
posthog.screen('dashboard', {
    background: 'blue',
    hero: 'superhog',
})
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```kotlin
import com.posthog.PostHog

PostHog.capture(event = "user_signed_up")
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```kotlin
import com.posthog.PostHog

PostHog.capture(
    event = "user_signed_up",
    properties = mapOf(
        "login_type" to "email",
        "is_free_trial" to true
    )
)
```

### Autocapture 

PostHog autocapture automatically tracks the following events for you:

-   **Application Opened** - when the app is opened from a closed state or when the app comes to the foreground. (e.g. from the app switcher)
-   **Deep Link Opened** - when the app is opened from a deep link.
-   **Application Backgrounded** - when the app is sent to the background by the user.
-   **Application Installed** - when the app is installed.
-   **Application Updated** - when the app is updated.
-   **$screen** - when the user navigates. (if using `android.app.Activity`)
-   **$exception** - when the app throws exceptions.

### Capturing screen views

With [`captureScreenViews = true`](/docs/libraries/android#all-configuration-options), PostHog will try to record all screen changes automatically.

The `screenTitle` will be the [`<activity>`](https://developer.android.com/guide/topics/manifest/activity-element)'s `android:label`, if not set it'll fallback to the [`<application>`](https://developer.android.com/guide/topics/manifest/application-element)'s `android:label` or the [`<activity>`](https://developer.android.com/guide/topics/manifest/activity-element)'s `android:name`.

```xml
<activity
    android:name="com.example.app.ChildActivity"
    android:label="@string/title_child_activity"
    ...
</activity>
```

If you want to manually send a new screen capture event, use the `screen` function.

This function requires a `screenTitle`. You may also pass in an optional `properties` object.

```kotlin
import com.posthog.PostHog

PostHog.screen(
    screenTitle = "Dashboard",
    properties = mapOf(
        "background" to "blue",
        "hero" to "superhog"
    )
)
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```swift
PostHogSDK.shared.capture("user_signed_up")
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```swift
PostHogSDK.shared.capture("user_signed_up", properties: ["login_type": "email"], userProperties: ["is_free_trial": true])
```

## Autocapture

PostHog autocapture automatically tracks the following events for you:

-   **Application Opened** - when the app is opened from a closed state or when the app comes to the foreground (e.g. from the app switcher)
-   **Application Backgrounded** - when the app is sent to the background by the user
-   **Application Installed** - when the app is installed
-   **Application Updated** - when the app is updated
-   **$screen** - when the user navigates (if using `UIViewController`)
-   **$autocapture** - when the user interacts with elements in a screen (if using `UIKit`)

> 🚧 **Note:** `$autocapture` is currently supported only in UIKit.

### Capturing screen views

With [`configuration.captureScreenViews`](/docs/libraries/ios/configuration#all-configuration-options) set as `true`, PostHog will try to record all screen changes automatically.

If you want to manually send a new screen capture event, use the `screen` function.

```swift
PostHogSDK.shared.screen("Dashboard", properties: ["fromIcon": "bottom"])
```

> **Important:** While `captureScreenViews` works with both `UIKit` and `SwiftUI`, the screen names captured in `SwiftUI` may not be very meaningful as they are based on internal SwiftUI view identifiers. For `SwiftUI` applications, we recommend turning this option off and instead using the `.postHogScreenView()` view modifier (see next section) to capture screen views with meaningful names.

> **Note:** You can use the `BeforeSendBlock` to filter or drop any undesired screen events, giving you control over which screen views are sent to PostHog. See [Amending, dropping or sampling events](/docs/libraries/ios#amending-dropping-or-sampling-events) for implementation examples.

### Capturing screen views in SwiftUI

To track a screen view in `SwiftUI`, apply the `postHogScreenView` modifier to your full-screen views. 
PostHog will send a `$screen` event when the `onAppear` action is executed and will infer a screen name based on the view’s type. You can provide a custom name and event properties if needed.

```swift file=HomeView.swift
// This will trigger a screen view event with $screen_name: "HomeViewContent"
struct HomeView: View {
    var body: some View {
        HomeViewContent()
            .postHogScreenView()
    }
}

// This will trigger a screen view event with $screen_name: "My Home View" and an additional event property from_button: "start"
struct HomeView: View {
    var body: some View {
        HomeViewContent()
            .postHogScreenView("My Home View", ["from_button": "start"])
    }
}
```

In SwiftUI, views can range from entire screens to small UI components. Unlike UIKit, SwiftUI doesn’t clearly distinguish between these levels, which makes automatic tracking of full-screen views harder.

### Adding a custom label on autocaptured elements

PostHog automatically captures interactions with various UI elements in your app, but these interactions are often identified by element type names (e.g., UIButton, UITextField, UILabel). 

While this provides basic tracking, it can be challenging to pinpoint specific interactions with particular elements in your analytics. To make your data more meaningful and actionable, you can assign custom labels to any autocaptured element. These labels act as descriptive identifiers, making it easier to identify, filter, and analyze events in your reports.

** Adding a custom label in UIKit **

To assign a custom label to a UIView, use the `postHogLabel` property:

```swift
let view = UIView()
view.postHogLabel = "usernameTextField"
```

In this example, interactions with the UITextField will be captured with an additional identifier "usernameTextField".

** Adding a custom label in SwiftUI **

In SwiftUI, use the `.postHogLabel(_:)` modifier instead:

```swift
var body: some View {
    ...
    TextField("username", text: $username)
        .postHogLabel("usernameTextField")
}
```

In this example, interactions with the _underlying_ UITextField will be captured with an additional identifier "usernameTextField".

**Example of generated analytics data**

The generated analytics element in the examples above will have the following form: 

```swift
<UITextField id="usernameTextField">text value</UITextField>
```

**Filtering for labeled autocaptured elements in reports**

To locate and filter interactions with specific elements in PostHog reports, you can use Autocapture element filters, such as:

- Tag Name (`UITextField` in this example)
- Text (`text value` in this example)
- CSS Selector (the generated `id` attribute in this example)

In the examples above, we can filter for the specific text field using the CSS Selector `#usernameTextField`

### Interaction autocapture

Interaction autocapture records when users interact with UI elements in your app. This includes:

- User interactions like `touch`, `swipe`, `pan`, `pinch`, `rotation`, `long_press`, `scroll`
- Control types `value_changed`, `submit`, `toggle`, `primary_action`, `menu_action`, `change`

Interaction autocapture is **not enabled by default**. You can enable it by setting `captureElementInteractions` to `true` in the config.

```swift
let config = PostHogConfig(apiKey: <ph_project_api_key>, host: <ph_client_api_host>)
config.captureElementInteractions = true // Disabled by default
PostHogSDK.shared.setup(config)
```

### Autocapture configuration

You can enable or disable autocapture through the `PostHogConfig` object. Find more details about autocapture configuration in the [configuration page](/docs/libraries/ios/configuration#autocapture-configuration).
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```java
postHog.capture("distinct_id_of_the_user", "user_signed_up");
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```java
postHog.capture(
    "distinct_id_of_the_user",
    "user_signed_up",
    PostHogCaptureOptions
        .builder()
        .property("login_type", "email")
        .property("is_free_trial", true)
        .build());
```
        </Tab.Panel>
        <Tab.Panel>
           You can send custom events using `capture`:

```rust
let mut event = Event::new("user_signed_up", "distinct_id_of_the_user");
client.capture(event).unwrap();
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```rust
let mut event = Event::new("user_signed_up", "distinct_id_of_the_user");

event.insert_prop("login_type", "email").unwrap();
event.insert_prop("is_free_trial", true).unwrap();

client.capture(event).unwrap();
```

### Batching events

To capture multiple events at once, use `batch()`:

```rust
let event1 = posthog_rs::Event::new("event 1", "distinct_id_of_user_A");
let event2 = posthog_rs::Event::new("event 2", "distinct_id_of_user_B");

client.capture_batch(vec![event1, event2]).unwrap();
```
        </Tab.Panel>
        <Tab.Panel>
            To capture an event, use `PostHog.capture/2`:

```elixir
PostHog.capture("user_signed_up", %{distinct_id: "distinct_id_of_the_user"})
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```elixir
PostHog.capture("user_signed_up", %{
  distinct_id: "distinct_id_of_the_user",
  login_type: "email",
  is_free_trial: true
})
```
### Context

Carrying `distinct_id` around all the time might not be the most convenient approach, so PostHog lets you store it and other properties in a context.

The context is stored in the `Logger` metadata and PostHog automatically attaches these properties to any events you capture with `PostHog.capture/2`, as long as they happen in the same process.

```elixir
PostHog.set_context(%{distinct_id: "distinct_id_of_the_user"})
PostHog.capture("page_opened")
```

You can also scope the context to a specific event name:

```elixir
PostHog.set_event_context("sensitive_event", %{"$process_person_profile": false})
```

### Batching events

Events are automatically batched and sent to PostHog via a background job.

### Special events

`PostHog.capture/2` is very powerful and enables you to send events that have special meaning.

In other libraries you'll usually find helpers for these special events, but they must be explicitly sent in Elixir.

For example:

#### Create alias

```elixir
PostHog.capture("$create_alias", %{distinct_id: "frontend_id", alias: "backend_id"})
```

#### Group analytics

```elixir
PostHog.capture("$groupidentify", %{
  distinct_id: "static_string_used_for_all_group_events",
  "$group_type": "company",
  "$group_key": "company_id_in_your_db"
})
```
        </Tab.Panel>
        <Tab.Panel>
           You can send custom events using `capture`:

```dart
await Posthog().capture(
  eventName: 'user_signed_up',
);
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```dart
await Posthog().capture(
  eventName: 'user_signed_up',
  properties: {
    'login_type': 'email',
    'is_free_trial': true
  }
);
```

### Autocapture 

PostHog autocapture automatically tracks the following events for you:

-   **Application Opened** - when the app is opened from a closed state or when the app comes to the foreground (e.g. from the app switcher)
-   **Application Backgrounded** - when the app is sent to the background by the user
-   **Application Installed** - when the app is installed.
-   **Application Updated** - when the app is updated.
-   **$screen** - when the user navigates (if using [navigatorObservers](https://docs.flutter.dev/ui/navigation) or [go_router](https://pub.dev/packages/go_router). You'd need to set up the `PosthogObserver` manually.)

### Capturing screen views

> Note: Your routes should be named. Otherwise, they won't be recorded.

#### Using `navigatorObservers`

Add the `PosthogObserver` to record screen views automatically:

```dart
import 'package:flutter/material.dart';
import 'package:posthog_flutter/posthog_flutter.dart';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // If you're using session replay, `PostHogWidget` has to be the root, and `MaterialApp` must be the child.
    return MaterialApp(
      navigatorObservers: [
        // The PosthogObserver records screen views automatically
        PosthogObserver(),
      ],
      ...
    );
  }
}
```

Name your routes:

```dart
...
MaterialPageRoute(builder: (context) => const HomeScreenRoute(),
  settings: const RouteSettings(name: 'Home Screen'),
),
...
```

#### Using `go_router`

Add the `PosthogObserver` to record screen views automatically:

```dart
import 'package:flutter/material.dart';
import 'package:posthog_flutter/posthog_flutter.dart';
import 'package:go_router/go_router.dart';

// GoRouter configuration
final _router = GoRouter(
  routes: [
    ...
  ],
  // The PosthogObserver records screen views automatically
  observers: [PosthogObserver()],
);

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // If you're using session replay, `PostHogWidget` has to be the root, and `MaterialApp` must be the child.
    return MaterialApp.router(
      routerConfig: _router,
    );
  }
}
```

Name your routes:

```dart
...
GoRoute(
  name: 'Home Screen',
  ...
),
...
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```csharp
posthog.Capture("distinct_id_of_the_user", "user_signed_up");
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```csharp
posthog.Capture(
    "distinct_id_of_the_user", 
    "user_signed_up", 
    properties: new() {
        ["login_type"] = "email", 
        ["is_free_trial"] = "true"
    }
);
```

### Sending page views

If you're aiming for a backend-only implementation of PostHog and won't be capturing events from your frontend, you can send `$pageview` events from your backend like so:

```csharp
using PostHog;
using Microsoft.AspNetCore.Http.Extensions;

posthog.CapturePageView(
    "distinct_id_of_the_user",
    HttpContext.Request.GetDisplayUrl());
```
        </Tab.Panel>
        <Tab.Panel>
            You can send custom events using `capture`:

```bash
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "distinct_id": "distinct_id_of_the_user",
    "event": "user_signed_up"
}' <ph_client_api_host>/i/v0/e/
```

> **Tip:** We recommend using a `[object] [verb]` format for your event names, where `[object]` is the entity that the behavior relates to, and `[verb]` is the behavior itself. For example, `project created`, `user signed up`, or `invite sent`.

### Setting event properties

Optionally, you can include additional information with the event by including a  [properties](/docs/data/events#event-properties) object:

```bash
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "properties": {
        "login_type": "email",
        "is_free_trial": "true"
    },
    "distinct_id": "distinct_id_of_the_user",
    "event": "user_signed_up"
}' <ph_client_api_host>/i/v0/e/
```

### Batching events

Events can be sent together in a batch. There is no limit on the number of events you can send in a batch, but the entire request body must be less than `20MB` by default.

```shell label=Batch
POST <ph_client_api_host>/batch/
Content-Type: application/json
Body:
{
    "api_key": "<ph_project_api_key>",
    "batch": [
        {
            "event": "event_name",
            "properties": {
                "distinct_id": "distinct_id_of_the_user",
                "key1": "value1",
                "key2": "value2"
            },
        },
        ...
    ]
}
```
        </Tab.Panel>
    </Tab.Panels>
</Tab.Group>

## Event ingestion

It's a priority for us that events are fully processed and saved as soon as possible. Typically, events will be usable in queries within a few minutes.

## Advanced: Anonymous vs identified events

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

### How to capture anonymous events

<Tab.Group tabs={[
    'Web', 
    'Backend', 
    'Android', 
    'iOS',
    'Flutter']}>
    <Tab.List>
        <Tab>Web</Tab>
        <Tab>Backend</Tab>
        <Tab>Android</Tab>
        <Tab>iOS</Tab>
        <Tab>Flutter</Tab>
    </Tab.List>
    <Tab.Panels>
        <Tab.Panel>
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
        </Tab.Panel>
        <Tab.Panel>
            PostHog's backend SDKs and API capture identified events by default. To capture anonymous events, set the `$process_person_profile` property to `false`:

<MultiLanguage>

```node
client.capture({
    distinctId: 'distinct_id_of_the_user',
    event: 'your_event_name',
    properties: {
        $process_person_profile: false,
    },
})
```

```python
posthog.capture(
    "distinct_id_of_the_user", 
    "your_event_name", 
    {
        "$process_person_profile": false
    }
)
```

```php
PostHog::capture(array(
  'distinctId' => 'distinct_id_of_the_user',
  'event' => 'your_event_name',
  'properties' => array(
    '$process_person_profile' => false
  )
));
```

```ruby
posthog.capture({
    distinct_id: 'distinct_id_of_the_user',
    event: 'your_event_name',
    properties: {
        $process_person_profile: false
    }
})
```

```go
client.Enqueue(posthog.Capture{
    DistinctId: "distinct_id_of_the_user",
    Event:      "your_event_name",
    Properties: posthog.NewProperties().
      Set("$process_person_profile", false),
})
```

```java
posthog.capture("distinct_id_of_the_user", "your_event_name", new HashMap<String, Object>() {
  {
    put("$process_person_profile", false);
  }
});
```

```rust
let mut event = Event::new("your_event_name", "distinct_id_of_the_user");

event.insert_prop("$process_person_profile", false).unwrap();

client.capture(event).unwrap();
```

```elixir
Posthog.capture("your_event_name", %{
  distinct_id: distinct_id_of_the_user,
  properties: %{
    "$process_person_profile": false
  }
})
```

```bash
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "properties": {
        "$process_person_profile": false
    },
    "distinct_id": "distinct_id_of_the_user",
    "event": "your_event_name"
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage>
        </Tab.Panel>
        <Tab.Panel>
           The Android SDK captures anonymous events by default. However, this may change depending on your `personProfiles` [config](/docs/libraries/android#all-configuration-options) when initializing PostHog:

1. `personProfiles = PersonProfiles.IDENTIFIED_ONLY` _(recommended)_ _(default)_ - Anonymous events are captured by default. PostHog only captures identified events for users where [person profiles](/docs/data/persons) have already been created.

2. `personProfiles = PersonProfiles.ALWAYS` - Capture identified events for all events.

3. `personProfiles = PersonProfiles.NEVER` - Capture anonymous events for all events.

For example:

```kotlin
val config = PostHogAndroidConfig(
   apiKey = POSTHOG_API_KEY,
   host = POSTHOG_HOST,
).apply {
   personProfiles = PersonProfiles.IDENTIFIED_ONLY
}
```
        </Tab.Panel>
        <Tab.Panel>
           The iOS SDK captures anonymous events by default. However, this may change depending on your `personProfiles` [config](/docs/libraries/ios/configuration#all-configuration-options) when initializing PostHog:

1. `personProfiles: .identifiedOnly` _(recommended)_ _(default)_ - Anonymous events are captured by default. PostHog only captures identified events for users where [person profiles](/docs/data/persons) have already been created.

2. `personProfiles: .always` - Capture identified events for all events.

3. `personProfiles: .never` - Capture anonymous events for all events.

For example:

```ios_swift
let config = PostHogConfig(
    apiKey: POSTHOG_API_KEY, 
    host: POSTHOG_HOST
)
config.personProfiles = .identifiedOnly
PostHogSDK.shared.setup(config)
```
        </Tab.Panel>
        <Tab.Panel>
           The Flutter SDK captures anonymous events by default. However, this may change depending on your `personProfiles` [config](/docs/libraries/flutter#person-profiles-anonymous-vs-identified-persons) when initializing PostHog:

1. `personProfiles: PostHogPersonProfiles.identifiedOnly` _(recommended)_ _(default)_ - Anonymous events are captured by default. PostHog only captures identified events for users where [person profiles](/docs/data/persons) have already been created.

2. `personProfiles: PostHogPersonProfiles.always` - Capture identified events for all events.

3. `personProfiles: PostHogPersonProfiles.never` - Capture anonymous events for all events.

For example:

```dart
final config = PostHogConfig('<ph_project_api_key>');
config.host = POSTHOG_HOST;
config.personProfiles = PostHogPersonProfiles.identifiedOnly;
```
        </Tab.Panel>
    </Tab.Panels>
</Tab.Group>

### How to capture identified events

<Tab.Group tabs={[
    'Web', 
    'Backend', 
    'Android', 
    'iOS',
    'Flutter']}>
    <Tab.List>
        <Tab>Web</Tab>
        <Tab>Backend</Tab>
        <Tab>Android</Tab>
        <Tab>iOS</Tab>
        <Tab>Flutter</Tab>
    </Tab.List>
    <Tab.Panels>
        <Tab.Panel>
            If you've set the [`personProfiles` config](/docs/libraries/js/config) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. To capture identified events, call any of the following functions:

- [`identify()`](/docs/product-analytics/identify)
- [`alias()`](/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](/docs/product-analytics/group-analytics)
- [`setPersonProperties()`](/docs/product-analytics/person-properties)
- [`setPersonPropertiesForFlags()`](/docs/libraries/js/features#overriding-server-properties)
- [`setGroupPropertiesForFlags()`](/docs/libraries/js/features#overriding-server-properties)

When you call any of these functions, it creates a [person profile](/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.
        </Tab.Panel>
        <Tab.Panel>
            PostHog's backend SDKs and API capture identified events by default.

<MultiLanguage>

```node
client.capture({
    distinctId: 'distinct_id_of_the_user',
    event: 'your_event_name',
})
```

```python
posthog.capture(
    "distinct_id_of_the_user", 
    "your_event_name", 
)
```

```php
PostHog::capture(array(
  'distinctId' => 'distinct_id_of_the_user',
  'event' => 'your_event_name',
));
```

```ruby
posthog.capture({
    distinct_id: 'distinct_id_of_the_user',
    event: 'your_event_name',
})
```

```go
client.Enqueue(posthog.Capture{
    DistinctId: "distinct_id_of_the_user",
    Event:      "your_event_name",
})
```

```java
posthog.capture("distinct_id_of_the_user", "your_event_name", new HashMap<String, Object>() {});
```

```rust
let mut event = Event::new("your_event_name", "distinct_id_of_the_user");

client.capture(event).unwrap();
```

```elixir
Posthog.capture("your_event_name", %{
  distinct_id: distinct_id_of_the_user
})
```

```API
curl -v -L --header "Content-Type: application/json" -d '{
    "api_key": "<ph_project_api_key>",
    "distinct_id": "distinct_id_of_the_user",
    "event": "your_event_name"
}' <ph_client_api_host>/i/v0/e/
```

</MultiLanguage>
        </Tab.Panel>
        <Tab.Panel>
            If you've set the [`personProfiles` config](/docs/libraries/android#all-configuration-options) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. Then, to capture identified events, call any of the following functions:

- [`identify()`](/docs/product-analytics/identify)
- [`alias()`](/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](/docs/product-analytics/group-analytics)

When you call any of these functions, it creates a [person profile](/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.
        </Tab.Panel>
        <Tab.Panel>
           If you've set the [`personProfiles` config](/docs/libraries/ios/configuration#all-configuration-options) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. Then, to capture identified events, call any of the following functions:

- [`identify()`](/docs/product-analytics/identify)
- [`alias()`](/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](/docs/product-analytics/group-analytics)

When you call any of these functions, it creates a [person profile](/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.
        </Tab.Panel>
        <Tab.Panel>
           If you've set the [`personProfiles` config](/docs/libraries/flutter#person-profiles-anonymous-vs-identified-persons) to `IDENTIFIED_ONLY` (the default option), anonymous events are captured by default. Then, to capture identified events, call any of the following functions:

- [`identify()`](/docs/product-analytics/identify)
- [`alias()`](/docs/product-analytics/identify#alias-assigning-multiple-distinct-ids-to-the-same-user)
- [`group()`](/docs/product-analytics/group-analytics)

When you call any of these functions, it creates a [person profile](/docs/data/persons) for the user. Once this profile is created, all subsequent events for this user will be captured as identified events.

Alternatively, you can set `personProfiles` to `ALWAYS` to capture identified events by default.
        </Tab.Panel>
    </Tab.Panels>
</Tab.Group>
