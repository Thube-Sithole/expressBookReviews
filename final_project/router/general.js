
const express = require('express');
const axios = require('axios');

const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;

const public_users = express.Router();

const PORT = process.env.PORT || 5000;
const BOOKS_API_URL =
    process.env.BOOKS_API_URL || `http://127.0.0.1:${PORT}/_internal/books`;

// Retrieve the catalogue using Axios
async function fetchBooks() {
    const response = await axios.get(BOOKS_API_URL, {
        timeout: 5000
    });

    return response.data;
}

// Handle errors from the internal catalogue request
function handleAxiosError(res, error) {
    console.error('Book retrieval error:', error.message);

    if (error.response) {
        return res.status(error.response.status).json({
            message: 'Unable to retrieve books'
        });
    }

    return res.status(502).json({
        message: 'Book catalogue is unavailable'
    });
}

// Task 6: Register a new user
public_users.post('/register', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: 'User already exists'
        });
    }

    users.push({ username, password });

    return res.status(200).json({
        message: 'User successfully registered. Now you can login'
    });
});

// Task 1 and Task 10: Get all books using Axios and async/await
public_users.get('/', async (req, res) => {
    try {
        const books = await fetchBooks();
        return res.status(200).json(books);
    } catch (error) {
        return handleAxiosError(res, error);
    }
});

// Task 2 and Task 11: Get book details by ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const books = await fetchBooks();
        const isbn = req.params.isbn;

        if (!books[isbn]) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(books[isbn]);
    } catch (error) {
        return handleAxiosError(res, error);
    }
});

// Task 3 and Task 12: Get books by author
public_users.get('/author/:author', async (req, res) => {
    try {
        const books = await fetchBooks();
        const author = req.params.author.toLowerCase();
        const matchingBooks = {};

        Object.keys(books).forEach((isbn) => {
            if (books[isbn].author.toLowerCase() === author) {
                matchingBooks[isbn] = books[isbn];
            }
        });

        return res.status(200).json(matchingBooks);
    } catch (error) {
        return handleAxiosError(res, error);
    }
});

// Task 4 and Task 13: Get books by title
public_users.get('/title/:title', async (req, res) => {
    try {
        const books = await fetchBooks();
        const title = req.params.title.toLowerCase();
        const matchingBooks = {};

        Object.keys(books).forEach((isbn) => {
            if (books[isbn].title.toLowerCase() === title) {
                matchingBooks[isbn] = books[isbn];
            }
        });

        return res.status(200).json(matchingBooks);
    } catch (error) {
        return handleAxiosError(res, error);
    }
});

// Task 5: Get reviews by ISBN
public_users.get('/review/:isbn', async (req, res) => {
    try {
        const books = await fetchBooks();
        const isbn = req.params.isbn;

        if (!books[isbn]) {
            return res.status(404).json({
                message: 'Book not found'
            });
        }

        return res.status(200).json(books[isbn].reviews);
    } catch (error) {
        return handleAxiosError(res, error);
    }
});

module.exports.general = public_users;
