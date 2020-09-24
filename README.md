# JavaScript Notes API
`javascript-notes-api` is a backend server implementation built on top `Node.js` and `Express.js` with `Mongoose.js` for `MongoDB` integration that can be deployed to any infrastructure that can run Node.js.

Also using `JSON Web Token (JWT)` to securely transmit information.

# Getting Started
Before you start make sure you have installed:
* [`Node.js`](https://nodejs.org)
* [`MongoDB`](https://www.mongodb.com)

JSON Web Token (JWT) need a secret string which is then used to encrypt this user login credentials. Thats why we store this string in .env file. So create this .env file in the root directory and inside it type.

More details check this article:[`JSON Web Token (JWT) — The right way of implementing, with Node.js`](https://medium.com/@siddharthac6/json-web-token-jwt-the-right-way-of-implementing-with-node-js-65b8915d550e)

## Available Scripts
Clone repo, in the project directory, you can run:
```git
npm install
```
This command installs a package, and any packages that it depends on.

## Start App
```git
PORT=3001 npm run dev
```

The server will reload if you make edits.<br />
You will also see any lint errors in the console.

Check the frontend app: [`javascript-notes-api`](https://github.com/cesardoliveira/javascript-notes-api)