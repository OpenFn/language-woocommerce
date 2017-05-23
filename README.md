Language Woo Commerce [![Build Status](https://travis-ci.org/OpenFn/language-http.svg?branch=master)](https://travis-ci.org/OpenFn/language-http)
=============

Language Pack for building expressions and operations to make calls to the Woo Commerce API.

Documentation
-------------
## Fetch

#### sample configuration
```js
{
  "username": "taylor@openfn.org",
  "password": "supersecret",
  "baseUrl": "https://instance_name.surveycto.com",
  "authType": "digest"
}
```

#### sample fetch expression
```js
fetch(endpoint, postUrl)
```

[Docs](docs/index)


Development
-----------

Clone the repo, run `npm install`.

Run tests using `npm run test` or `npm run test:watch`

Build the project using `make`.
