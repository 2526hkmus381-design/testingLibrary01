const uri = "mongodb+srv://renderDeploy:renderDeploy@cluster0.nuoxsbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const express = require('express');
const bodyParser = require('body-parser');
//const client = new MongoClient(uri);

//const userCollection = "userCollection";
const path = require('path');
const mongoose = require('mongoose');
const app = express();<!-- views/bookDetails.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Details</title>
    <!-- Font Awesome for icons -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <!-- Inter font from Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 0;
            padding: 20px;
            font-family: 'Inter', sans-serif;
            background-color: #f8f8f8;
            color: #333;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }

        .book-card {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            max-width: 600px;
            width: 100%;
            box-sizing: border-box;
            margin: 0 auto;
        }

        .book-card h2 {
            font-size: 22px;
            font-weight: 700;
            margin-bottom: 15px;
            color: #333;
        }

        .book-card p {
            font-size: 16px;
            color: #666;
            margin: 10px 0;
        }

        .book-card .available {
            color: #28a745;
            font-weight: bold;
        }

        .book-card .unavailable {
            color: #dc3545;
            font-weight: bold;
        }

        .reserve-button {
            background-color: #28a745;
            color: #ffffff;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
            margin-top: 20px;
            display: inline-block;
            width: 100%;
            text-align: center;
        }

        .reserve-button:hover {
            background-color: #218838;
        }

        .reserve-button:disabled {
            background-color: #6c757d;
            cursor: not-allowed;
        }

        .error-message {
            color: #dc3545;
            font-size: 16px;
            text-align: center;
            margin-top: 20px;
        }

        .back-link {
            display: inline-block;
            margin-top: 20px;
            font-size: 16px;
            color: #007bff;
            text-decoration: none;
            text-align: center;
        }

        .back-link:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .book-card {
                padding: 15px;
            }

            h1 {
                font-size: 20px;
            }

            .book-card h2 {
                font-size: 18px;
            }

            .book-card p {
                font-size: 14px;
            }

            .reserve-button {
                padding: 8px 16px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <h1>Book Details</h1>

    <% if (typeof book !== 'undefined' && book && book._id) { %>
        <div class="book-card">
            <h2><%= book.title || 'Untitled' %></h2>
            <p><strong>Author:</strong> <%= book.author || 'Unknown' %></p>
            <p><strong>ISBN:</strong> <%= book.isbn || 'N/A' %></p>
            <p><strong>Genre:</strong> <%= book.genre || 'N/A' %></p>
            <p><strong>Published Year:</strong> <%= book.publishedYear || 'N/A' %></p>
            <p><strong>Available Copies:</strong> 
                <span class="<%= (book.availableCopies || 0) > 0 ? 'available' : 'unavailable' %>">
                    <%= book.availableCopies || 0 %> / <%= book.totalCopies || 0 %>
                </span>
            </p>
            <p><strong>Description:</strong> <%= book.description || 'No description available' %></p>
            <form action="/reserve-book/<%= book._id %>" method="POST">
                <button type="submit" class="reserve-button" <%= (book.availableCopies || 0) === 0 ? 'disabled' : '' %>>
                    Reserve Book
                </button>
            </form>
            <a href="/views/user_DiscoveryPage" class="back-link">Back to Discover Books</a>
        </div>
    <% } else { %>
        <p class="error-message">Book not found.</p>
        <a href="/views/user_DiscoveryPage" class="back-link">Back to Discover Books</a>
    <% } %>

    <% if (typeof error !== 'undefined' && error) { %>
        <p class="error-message"><%= error %></p>
    <% } %>
</body>
</html>
const port = process.env.PORT || 8099;
let db; ///NEW

app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, '1')));

app.use(bodyParser.urlencoded({ extended: true }));  // for form data
app.use(bodyParser.json());


// Connect to MongoDB
mongoose.connect(uri,{
      dbName:"test"
    }
                 )
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));




// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    name: String
});

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
  try{
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

// Server main page
//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '1', 'index.html'));
//});

// Server login page
//app.get('/', (req, res) => {
 // res.sendFile(path.join(__dirname, '1', 'user-dashboard.html'));
//});

// Server login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log("The username is "+ username);
  console.log("the password is "+ password);
  try {
    //await console.log(User.findOne({}));
    var user = await User.findOne({ username:username });
    //console.log(user.username)
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
        const books = await Book.find({}).lean(); // Fetch all books and convert to plain JS objects
        console.log('Books fetched:', books); // Debug log to verify data
        res.render('user_dashboard', {
            title: 'User Dashboard',
            books: Array.isArray(books) ? books : [] // Ensure books is always an array
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('user_dashboard', {
            title: 'User Dashboard',
            books: [], // Send empty array on error
            error: 'Failed to load books. Please try again later.'
        });
    }
});

app.get('/views/user_DiscoveryPage', async (req, res) => {
    try {
        const books = await Book.find({}).lean(); // Fetch all books and convert to plain JS objects
        console.log('Books fetched:', books); // Debug log to verify data
        res.render('user_DiscoveryPage', {
            title: 'User DiscoveryPage',
            books: Array.isArray(books) ? books : [] // Ensure books is always an array
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        
    }
});

// Server admin dashboard
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '1', 'admin-dashboard.html'));
});



app.listen(port, () => {
  console.log(`*`)
})

