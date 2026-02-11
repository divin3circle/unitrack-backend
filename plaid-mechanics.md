

Get started with the Quickstart 
================================

#### A quick introduction to building with Plaid 

[Watch video](https://www.youtube.com/watch?v=U9xa1gzyPx8)

Want more video tutorials? The [full getting started guide](https://www.youtube.com/watch?v=sGBvKDGgPjc) for the Quickstart app is available on YouTube.

Don't want to write code? Check out the [Plaid Postman Collection](https://github.com/plaid/plaid-postman) for a no-code way to get started with Plaid's API.

Looking to get started with Identity Verification, Income Verification, or Layer?

For Identity Verification, check out the [Identity Verification Quickstart](https://github.com/plaid/idv-quickstart) .

For Income, try the [Income Verification Starter app](https://github.com/plaid/income-sample) .

For Layer, use the [Layer Quickstart](https://github.com/plaid/layer-quickstart) .

### Introduction 

Let’s test out running Plaid locally by cloning the Quickstart app. You’ll need API keys, which you can receive by signing up in the [Dashboard](https://dashboard.plaid.com/developers/keys) .

You'll have two different API keys, and there are three different Plaid environments. Today we'll start in the Sandbox environment. View the API Keys section of the Dashboard to find your Sandbox secret.

###### API Key 

[View Keys in Dashboard](https://dashboard.plaid.com/developers/keys)

client\_id

Private identifier for your team

secret

Private key, one for each of the three environments

###### Environment 

Sandbox

Get started with test credentials and life-like data

Production

Test or launch your app with unlimited live credentials

If you get stuck at any point in the Quickstart, help is just a click away! Check the Quickstart [troubleshooting guide](https://github.com/plaid/quickstart#troubleshooting) or ask other developers in our [Stack Overflow community](https://stackoverflow.com/questions/tagged/plaid) .

### Quickstart setup 

Once you have your API keys, it's time to run the Plaid Quickstart locally! The instructions below will guide you through the process of cloning the [Quickstart repository](https://github.com/plaid/quickstart) , customizing the .env file with your own Plaid client ID and Sandbox secret, and finally, building and running the app.

Plaid offers both Docker and non-Docker options for the Quickstart. If you don't have Docker installed, you may wish to use the non-Docker version; this path is especially recommended for Windows users who do not have Docker installations. However, if you already have Docker installed, we recommend the Docker option because it is simpler and easier to run the Quickstart. Below are instructions on setting up the Quickstart with Docker and non-Docker configurations.

Select group for content switcher

Non-DockerDocker

#### Setting up without Docker 

Make sure you have [npm installed](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) before following along. If you're using Windows, ensure you have a terminal capable of running basic Unix shell commands.

1\. Clone the Quickstart and run the backend

Node▼

```javascript
# Note: If on Windows, run
# git clone -c core.symlinks=true https://github.com/plaid/quickstart
# instead to ensure correct symlink behavior

git clone https://github.com/plaid/quickstart.git

# Copy the .env.example file to .env, then fill
# out PLAID_CLIENT_ID and PLAID_SECRET in .env
cp .env.example .env

cd quickstart/node

# Install dependencies
npm install

# Start the backend app
./start.sh
```

Open a new shell and start the frontend app. Your app will be running at `http://localhost:3000`.

2\. Run the Quickstart frontend

```bash
# Install dependencies
cd quickstart/frontend
npm install

# Start the frontend app
npm start

# Go to http://localhost:3000
```

Visit localhost and log in with Sandbox credentials (typically `user_good` and `pass_good`, as indicated at the bottom of the page).

(An image of "Plaid Quickstart guide with 'Launch Link' button to simulate user bank account integration.")

#### Setting up with Docker 

Docker is a software platform that packages software into standardized units called containers that have everything the software needs to run, including libraries, system tools, code, and runtime. If you don't already have Docker, you can [download it from the Docker site](https://docs.docker.com/get-docker/) . Note that Windows users may need to take some additional steps, such installing a Linux environment; if you are using Windows and do not already have a Linux environment installed, we recommend selecting the non-Docker instructions instead.

Once Docker is installed, launch the Docker app, then use the following commands at the command line to configure and run the Quickstart. If the `make` commands do not work, ensure that Docker is running. You may also need to prefix the `make` commands with `sudo`, depending on your environment.

1\. Clone and run the Quickstart

```bash
# Note: If on Windows, run
# git clone -c core.symlinks=true https://github.com/plaid/quickstart
# instead to ensure correct symlink behavior

git clone https://github.com/plaid/quickstart.git
cd quickstart

# Copy the .env.example file to .env, then fill
# out PLAID_CLIENT_ID and PLAID_SECRET in .env
cp .env.example .env

# start the container for one of these languages:
# node, python, java, ruby, or go

make up language=node

# Go to http://localhost:3000
```

Visit localhost and log in with Sandbox credentials (typically `user_good` and `pass_good`, as indicated at the bottom of the page).

(An image of "Plaid Quickstart page with 'Launch Link' button to connect bank accounts via Plaid API integration.")

View the logs

```bash
$ make logs language=node
```

Stop the container

```bash
$ make stop language=node
```

#### Create your first Item 

Most API requests interact with an _Item_, which is a Plaid term for a login at a financial institution. A single end-user of your application might have accounts at different financial institutions, which means they would have multiple different Items. An Item is not the same as a financial institution account, although every account will be associated with an Item. For example, if a user has one login at their bank that allows them to access both their checking account and their savings account, a single Item would be associated with both of those accounts.

Now that you have the Quickstart running, you’ll add your first Item in the Sandbox environment. Once you’ve opened the Quickstart app on localhost, click the **Launch Link** button and select any institution. Use the Sandbox credentials to simulate a successful login.

##### Sandbox credentials 

```bash
username: user_good
password: pass_good
If prompted to enter a 2FA code: 1234
```

Once you have entered your credentials and moved to the next screen, you have created your first Item! You can now make API calls for that Item by using the buttons in the Quickstart. In the next section, we'll explain what actually happened and how the Quickstart works.

### How it works 

As you might have noticed, you use both a server and a client-side component to access the Plaid APIs. The flow looks like this:

**The Plaid flow** begins when your user wants to connect their bank account to your app.

(An image of "Step diagram")

**1**Call [/link/token/create](https://plaid.com/docs/api/link/index.html.md#linktokencreate) to create a `link_token` and pass the temporary token to your app's client.

(An image of "Step 1 diagram")

**2**Use the `link_token` to open Link for your user. In the [onSuccess callback](https://plaid.com/docs/link/web/index.html.md#onsuccess) , Link will provide a temporary `public_token`. This token can also be obtained on the backend via `/link/token/get`.

(An image of "Step 2 diagram")

**3**Call [/item/public\_token/exchange](https://plaid.com/docs/api/items/index.html.md#itempublic_tokenexchange) to exchange the `public_token` for a permanent `access_token` and `item_id` for the new `Item`.

(An image of "Step 3 diagram")

**4**Store the `access_token` and use it to make product requests for your user's `Item`.

(An image of "Step 4 diagram")

The first step is to create a new `link_token` by making a [/link/token/create](https://plaid.com/docs/api/link/index.html.md#linktokencreate) request and passing in the required configurations. This `link_token` is a short lived, one-time use token that authenticates your app with [Plaid Link](https://plaid.com/docs/link/index.html.md) , our frontend module. Several of the environment variables you configured when launching the Quickstart, such as `PLAID_PRODUCTS`, are used as parameters for the `link_token`.

Node▼

```javascript
app.post('/api/create_link_token', async function (request, response) {
  // Get the client_user_id by searching for the current user
  const user = await User.find(...);
  const clientUserId = user.id;
  const linkTokenRequest = {
    user: {
      // This should correspond to a unique id for the current user.
      client_user_id: clientUserId,
    },
    client_name: 'Plaid Test App',
    products: ['auth'],
    language: 'en',
    webhook: 'https://webhook.example.com',
    redirect_uri: 'https://domainname.com/oauth-page.html',
    country_codes: ['US'],
  };
  try {
    const createTokenResponse = await client.linkTokenCreate(linkTokenRequest);
    response.json(createTokenResponse.data);
  } catch (error) {
    // handle error
  }
});

```

Once you have a `link_token`, you can use it to initialize [Link](https://plaid.com/docs/link/index.html.md) . Link is a drop-in client-side module available for web, iOS, and Android that handles the authentication process. The Quickstart uses Plaid's optional React bindings for an integration that you trigger via your own client-side code. This is what your users use to log into their financial institution accounts.

After a user submits their credentials within Link, Link provides you with a `public_token` via the `onSuccess` callback. The code below shows how the Quickstart passes the `public_token` from client-side code to the server. Both React and vanilla JavaScript examples are shown.

Initialize Link

React▼

```tsx
// APP COMPONENT
// Upon rendering of App component, make a request to create and
// obtain a link token to be used in the Link component
import React, { useEffect, useState } from 'react';
import { usePlaidLink } from 'react-plaid-link';
const App = () => {
  const [linkToken, setLinkToken] = useState(null);
  const generateToken = async () => {
    const response = await fetch('/api/create_link_token', {
      method: 'POST',
    });
    const data = await response.json();
    setLinkToken(data.link_token);
  };
  useEffect(() => {
    generateToken();
  }, []);
  return linkToken != null ? <Link linkToken={linkToken} /> : <></>;
};
// LINK COMPONENT
// Use Plaid Link and pass link token and onSuccess function
// in configuration to initialize Plaid Link
interface LinkProps {
  linkToken: string | null;
}
const Link: React.FC<LinkProps> = (props: LinkProps) => {
  const onSuccess = React.useCallback(async (public_token, metadata) => {
    // send public_token to server
    const response = await fetch('/api/set_access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ public_token }),
    });
    // Handle response ...
  }, []);
  const config: Parameters<typeof usePlaidLink>[0] = {
    token: props.linkToken!,
    onSuccess,
  };
  const { open, ready } = usePlaidLink(config);
  return (
    <button onClick={() => open()} disabled={!ready}>
      Link account
    </button>
  );
};
export default App;

```

Next, on the server side, the Quickstart calls [/item/public\_token/exchange](https://plaid.com/docs/api/items/index.html.md#itempublic_tokenexchange) to obtain an `access_token`, as illustrated in the code excerpt below. The `access_token` uniquely identifies an Item and is a required argument for most Plaid API endpoints. In your own code, you'll need to securely store your `access_token` in order to make API requests for that Item.

Node▼

```javascript
app.post('/api/exchange_public_token', async function (
  request,
  response,
  next,
) {
  const publicToken = request.body.public_token;
  try {
    const tokenResponse = await client.itemPublicTokenExchange({
      public_token: publicToken,
    });

    // These values should be saved to a persistent database and
    // associated with the currently signed-in user
    const accessToken = tokenResponse.data.access_token;
    const itemID = tokenResponse.data.item_id;

    response.json({ public_token_exchange: 'complete' });
  } catch (error) {
    // handle error
  }
});

```

#### Making API requests 

Now that we've gone over the Link flow and token exchange process, we can explore what happens when you press a button in the Quickstart to make an API call. As an example, we'll look at the Quickstart's call to [/accounts/get](https://plaid.com/docs/api/accounts/index.html.md#accountsget) , which retrieves basic information, such as name and balance, about the accounts associated with an Item. The call is fairly straightforward and uses the `access_token` as a single argument to the Plaid client object.

/accounts/get

Node▼

```javascript
app.get('/api/accounts', async function (request, response, next) {
  try {
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    });
    prettyPrintResponse(accountsResponse);
    response.json(accountsResponse.data);
  } catch (error) {
    prettyPrintResponse(error);
    return response.json(formatError(error.response));
  }
});

```

Example response data:

/accounts/get response

```json
{
  "accounts": [
    {
      "account_id": "A3wenK5EQRfKlnxlBbVXtPw9gyazDWu1EdaZD",
      "balances": {
        "available": 100,
        "current": 110,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "0000",
      "name": "Plaid Checking",
      "official_name": "Plaid Gold Standard 0% Interest Checking",
      "subtype": "checking",
      "type": "depository"
    },
    {
      "account_id": "GPnpQdbD35uKdxndAwmbt6aRXryj4AC1yQqmd",
      "balances": {
        "available": 200,
        "current": 210,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "1111",
      "name": "Plaid Saving",
      "official_name": "Plaid Silver Standard 0.1% Interest Saving",
      "subtype": "savings",
      "type": "depository"
    },
    {
      "account_id": "nVRK5AmnpzFGv6LvpEoRivjk9p7N16F6wnZrX",
      "balances": {
        "available": null,
        "current": 1000,
        "iso_currency_code": "USD",
        "limit": null,
        "unofficial_currency_code": null
      },
      "mask": "2222",
      "name": "Plaid CD",
      "official_name": "Plaid Bronze Standard 0.2% Interest CD",
      "subtype": "cd",
      "type": "depository"
    },
    ...
  ],
  "item": {
    "available_products": [
      "assets",
      "balance",
      "identity",
      "investments",
      "transactions"
    ],
    "billed_products": ["auth"],
    "consent_expiration_time": null,
    "error": null,
    "institution_id": "ins_12",
    "item_id": "gVM8b7wWA5FEVkjVom3ri7oRXGG4mPIgNNrBy",
    "webhook": "https://requestb.in"
  },
  "request_id": "C3IZlexgvNTSukt"
}
```

#### Next steps 

Congratulations, you have completed the Plaid Quickstart! From here, we invite you to modify the Quickstart code in order to get more practice with the Plaid API. There are a few directions you can go in now:

Go to the [docs homepage](https://plaid.com/docs/index.html.md) for links to product-specific documentation.

For more sample apps, including a bare-bones minimal Plaid Quickstart implementation and apps demonstrating real world examples of funds transfer and personal financial management, see [sample apps](https://plaid.com/docs/resources/index.html.md#sample-apps) .

Our YouTube playlist [Plaid in 3 minutes](https://www.youtube.com/playlist?list=PLyKH4ZiEQ1bE7XBcpX81BQWLy1olem1wf) has brief introductions to many Plaid products. For more detailed tutorial videos, see [Plaid Academy](https://www.youtube.com/playlist?list=PLyKH4ZiEQ1bH5wpCt9SiyVfHlV2HecFBq) .

Looking to move money with a Plaid partner, such as [Dwolla](https://plaid.com/docs/auth/partnerships/dwolla/index.html.md) ? See [Move money with our partners](https://plaid.com/docs/auth/partnerships/index.html.md) for partner-specific money movement Quickstarts.

The Quickstart covers working with web apps. If your Plaid app will be on mobile, see [Plaid Link](https://plaid.com/docs/link/index.html.md) to learn about getting started with mobile client-side setup.

Need help?

If you'd like to integrate with Plaid and don't have in-house technical resources, [contact a Plaid integration partner](https://plaid.com/docs/resources/index.html.md#integration-support) to build a Plaid integration for you.