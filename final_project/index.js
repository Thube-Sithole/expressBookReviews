
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const books = require('./router/booksdb.js');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'access';

app.use(express.json());

// Session configuration for customer routes
app.use(
    '/customer',
    session({
        secret: 'fingerprint_customer',
        resave: true,
        saveUninitialized: true
    })
);

// Authentication middleware for protected review routes
app.use('/customer/auth/*', (req, res, next) => {
    const token = req.session.authorization?.accessToken;

    if (!token) {
        return res.status(403).json({
            message: 'User not authenticated'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                message: 'User not authenticated'
            });
        }

        req.user = user;
        next();
    });
});

// Internal endpoint used by Axios to retrieve the book catalogue
app.get('/_internal/books', (req, res) => {
    return res.status(200).json(books);
});

// Mount application routes
app.use('/customer', customer_routes);
app.use('/', genl_routes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
