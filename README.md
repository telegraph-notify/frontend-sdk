# React SDK for Telegraph

The React SDK is used for displaying **In-App** notifications and for users to change their notification preferences.

## Table of Contents

- [Quick Start](#quick-start)
- [Documentation](#documentation)

## Quick Start

Install the React SDK from npm.

```bash
$ npm i @telegraph-notify/frontend-sdk
```

Then import and mount the notification component in your top-level components.

```tsx
import { Telegraph } from "@telegraph-notify/frontend-sdk";

<App>
  <Telegraph
    user_id={<USER_ID>} // The unique identifier of the logged in user
    userHash={<USER_HMAC>} // The hashed user_id
    websocketUrl={<WEBSOCKET_GATEWAY_URL>} // The websocket gateway url
  />
</App>
```

## Documentation

Please refer to the [Telegraph documentation](link-coming-soon) for more information about this SDK.
