# CB

## Description

Designed and implemented a website with member-only login functionality.

![](/public/images/screen1.png)

![](/public/images/screen2.png)

## Features

- a whitelist of member emails which are able to register
- a hidden registration page
- login/registration server-side validation system
- the option to reset password
- file uploading once logged in

## Usage

```
$ npm install 
```
#### secrets folder

- database.js

config for both db and nodemailer
```
const config = {
    databaseStr:
        "", // db string
    host: "", // e.g. smtp.ethereal.email
    email: "", // sender email
    password: "", //sender pasword
    personal: "" // your email
};

module.exports = config;
```

- allow.js

collection of whitelisted email addresses
```
const list = [
    { email: "" //email address 1 },
    { email: "" // email 2 etc }
];

module.exports = list;
```
```
# Run with Nodemon
$ npm run dev

# Visit http://localhost:3000
```

## Components

### Backend

- Node.js
- Express Framework

### Frontend

- EJS
- Express EJS Layouts
- Bootstrap 4

### Database

- MongoDB (Atlas)
- gridfs
- Mongoose

### Middleware etc.

- Express Session
- Connect flash
- Nodemailer
- Passport

Thanks Traversy Media tutorials for guidance with building the login system




