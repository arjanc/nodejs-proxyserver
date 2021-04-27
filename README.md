# nodejs-proxyserver
A pure nodejs proxy server to test a live website with custom modifications locally

## Setup
This proxy server uses a self signed certificate. You first need to [create your own](https://betterprogramming.pub/trusted-self-signed-certificate-and-local-domains-for-testing-7c6e6e3f9548) `private key` and `cert` file. Put those in the config directory.
After creating the certificates run the following command.
```
npm install
```

## Start
```
npm run start
```

## Inspect
Navigate to [https://localhost:8443](https://localhost:8443)

# Make changes
In this example we copied the homepage html of Github.com (see index.html). In the `index.html` we changed an image and the home.css to be loaded from the localhost system.
```
<link crossorigin="anonymous" media="all" rel="stylesheet" href="https://localhost:8443/css/home.css" />
```
Inside `server.js` we added a switch statement to grab the css/home.css and load our local file. For the logo.png we specified that our local server should 'mock' all assets with a url beginning with `assets`.