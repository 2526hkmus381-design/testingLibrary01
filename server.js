const uri = "mongodb+srv://renderDeploy:renderDeploy@cluster0.nuoxsbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 8099;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '1')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(uri, {
    dbName: "test"
})
.then(() => console.log("Connected to MongoDB Atlas"))
.catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    phone: String,
    email: String,
    name: String,
    role: { type: String, enum: ['admin', 'user'] }
    
});

module.exports = mongoose.model('User', userSchema);

const User = mongoose.model('users', userSchema);

// Book Schema
const bookSchema = new mongoose.Schema({
    title: String,
    author: String,
    isbn: String,
    genre: String,
    publishedYear: Number,
    totalCopies: Number,
    availableCopies: Number,
    description: String
});

const Book = mongoose.model('Book', bookSchema);

// Borrow Schema
const borrowSchema = new mongoose.Schema({
    userId: String,
    username: String,
    bookId: String,
    bookTitle: String,
    borrowDate: { type: Date, default: Date.now },
    returnDate: Date,
    status: { type: String, default: 'borrowed' }
});

const Borrow = mongoose.model('Borrow', borrowSchema);

// Review Schema
const reviewSchema = new mongoose.Schema({
    userId: String,
    username: String,
    bookId: String,
    bookTitle: String,
    rating: Number,
    comment: String,
    date: { type: Date, default: Date.now }
});

const Review = mongoose.model('Review', reviewSchema);

// Initialize default users
async function initializeUsers() {
    const users = await User.find();
    if (users.length === 0) {
        await User.create([
            { username: 'admin', password: 'admin123', role: 'admin', name: 'Library Admin' },
            { username: 'john', password: 'john123', role: 'user', name: 'John Doe' },
            { username: 'sarah', password: 'sarah123', role: 'user', name: 'Sarah Smith' }
        ]);
        console.log('Default users created');
    }
}

async function printAllUser() {
    try {
        const documents = await User.find({});
        console.log("All the documents in the userCollection: ");
        documents.forEach(doc => {
            console.log(doc.toJSON());
        });
    } catch (error) {
        console.error("Error in retrieving documents: ", error);
    }
}

printAllUser();
//GET USERS
app.get('/users', async (req, res) => {
  const users = await User.find();
  res.render('users', { users });
});
//ADD USERS
app.get('/add-user', (req, res) => {
  res.render('add-user');
});

app.post('/add-user', express.urlencoded({ extended: true }), async (req, res) => {
  const { name, username, password, phone, email, role } = req.body;
  try {
    await User.create({ name, username, password, phone, email, role });
    res.redirect('/users');
  } catch (err) {
    res.status(500).send('Error adding user');
  }
});

// Server login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("The username is " + username);
    console.log("the password is " + password);
    try {
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).send('Invalid username or password. <a href="/">Try again</a>');
        }
        if (user.role === 'admin') {
            return res.redirect('/admin-dashboard');
        }
        return res.redirect('/user-dashboard');
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Server error');
    }
});

// Server user dashboard
app.get('/user-dashboard', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        console.log('Books fetched:', books);
        res.render('userDashboard', {
            title: 'User Dashboard',
            books: Array.isArray(books) ? books : []
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('userDashboard', {
            title: 'User Dashboard',
            books: [],
            error: 'Failed to load books. Please try again later.'
        });
    }
});

// Server book discovery page
app.get('/views/userDiscoveryPage', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        console.log('Books fetched:', books);
        res.render('userDiscoveryPage', {
            title: 'User DiscoveryPage',
            books: Array.isArray(books) ? books : []
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('userDiscoveryPage', {
            title: 'User DiscoveryPage',
            books: [],
            error: 'Failed to load books. Please try again later.'
        });
    }
});

app.get('/views/userGenrePage', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        const genres = await Book.distinct('genre');
        console.log('Books fetched:', books);
        res.render('userGenrePage', {
            title: 'User genrePage',
            books: Array.isArray(books) ? books : [],
            genres:Array.isArray(genres)? genres :[]
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('userGenrePage', {
            title: 'User GenrePage',
            books: [],
            error: 'Failed to load books. Please try again later.'
        });
    }
});

// API: Get books by genre (or all if "all")
app.get('/api/books/genre/:genre', async (req, res) => {
  try {
    const genre = req.params.genre;
    let query = {};

    if (genre !== 'all') {
      query.genre = genre;
    }

    const books = await Book.find(query).lean();
    res.json(books);
  } catch (err) {
    console.error('Error fetching books by genre:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// server.js
// POST /api/books/filter – AND filter across multiple genres
app.post('/api/books/filter', async (req, res) => {
  try {
    const { genres = [] } = req.body;

    let query = {};
    if (genres.length > 0) {
      // Use $all to require ALL selected genres
      query.genre = { $all: genres };
    }

    const books = await Book.find(query).lean();
    res.json(books);
  } catch (err) {
    console.error('Error in /api/books/filter:', err);
    res.status(500).json({ error: 'Failed to filter books' });
  }
});

app.get('/views/userBookPage', async (req, res) => {
    try {
        const rbooks = await Borrow.find({}).lean();
        const bbooks = await Book.find({}).lean();
        console.log('Books fetched:', books);
        res.render('userBookPage', {
            title: 'User bookPage',
            borrowedbooks: Array.isArray(bbooks) ? bbooks : [],
            reservedbooks: Array.isArray(rbooks) ? rbooks : []
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('userBookPage', {
            title: 'User BookPage',
            books: [],
            error: 'Failed to load books. Please try again later.'
        });
    }
});

// Server book details page
app.get('/book-details/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id).lean();
        if (!book) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: null,
                error: 'Book not found.'
            });
        }
        res.render('bookDetails', {
            title: 'Book Details',
            book: book
        });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.render('bookDetails', {
            title: 'Book Details',
            book: null,
            error: 'Failed to load book details. Please try again later.'
        });
    }
});

// Server reserve book
app.post('/reserve-book/:id', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: null,
                error: 'Book not found.'
            });
        }
        if (book.availableCopies <= 0) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: book,
                error: 'No copies available to reserve.'
            });
        }

        // Placeholder: Assume user is 'john' (replace with session-based user in production)
        const user = await User.findOne({ username: 'john' });
        if (!user) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: book,
                error: 'User not found. Please log in.'
            });
        }

        // Create borrow record
        await Borrow.create({
            userId: user._id,
            username: user.username,
            bookId: book._id,
            bookTitle: book.title,
            borrowDate: new Date(),
            status: 'borrowed'
        });

        // Decrease available copies
        book.availableCopies -= 1;
        await book.save();

        // Redirect back to book details with success message
        res.render('bookDetails', {
            title: 'Book Details',
            book: book,
            error: 'Book reserved successfully!'
        });
    } catch (err) {
        console.error('Error reserving book:', err);
        res.render('bookDetails', {
            title: 'Book Details',
            book: book,
            error: 'Failed to reserve book. Please try again later.'
        });
    }
});

// Server admin dashboard
app.get('/admin-dashboard', (req, res) => {
     try {
        /*const books = await Book.find({}).lean();
        const users = await User.find({}).lean();
        const borrows = await Borrow.find({}).lean();*/
        
        res.render('adminDashboard', {
            title: 'Admin Dashboard',
            books: books,
            users: users,
            borrows: borrows
        });
    } catch (err) {
        console.error('Error loading admin dashboard:', err);
        res.render('adminDashboard', {
            title: 'Admin Dashboard',
            books: [],
            users: [],
            borrows: [],
            error: 'Failed to load dashboard data.'
        });
    }
});

app.get('/api/admin/books', async (req, res) => {
    try {
        const books = await Book.find({}).lean();
        res.json(books);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

app.post('/api/admin/books', async (req, res) => {
    try {
        const book = new Book(req.body);
        await book.save();
        res.status(201).json(book);
    } catch (err) {
        console.error('Error creating book:', err);
        res.status(500).json({ error: 'Failed to create book' });
    }
});

app.put('/api/admin/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(book);
    } catch (err) {
        console.error('Error updating book:', err);
        res.status(500).json({ error: 'Failed to update book' });
    }
});

app.delete('/api/admin/books/:id', async (req, res) => {
    try {
        const book = await Book.findByIdAndDelete(req.params.id);
        if (!book) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Server book details page
app.get('/book-details/:id', async (req, res) => {
    try {
        // Validate ObjectId
        if (!Types.ObjectId.isValid(req.params.id)) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: null,
                error: 'Invalid book ID.'
            });
        }
        const book = await Book.findById(req.params.id).lean();
        if (!book) {
            return res.render('bookDetails', {
                title: 'Book Details',
                book: null,
                error: 'Book not found.'
            });
        }
        console.log('Book fetched:', book); // Debug log
        res.render('bookDetails', {
            title: 'Book Details',
            book: book
        });
    } catch (err) {
        console.error('Error fetching book:', err);
        res.render('bookDetails', {
            title: 'Book Details',
            book: null,
            error: 'Failed to load book details. Please try again later.'
        });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
