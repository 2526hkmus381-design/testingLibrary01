const uri = "mongodb+srv://renderDeploy:renderDeploy@cluster0.nuoxsbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const express = require('express');
const bodyParser = require('body-parser');
//const client = new MongoClient(uri);

//const userCollection = "userCollection";
const path = require('path');
const mongoose = require('mongoose');
const app = express();
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
        res.render('testinguserdashboard', {
            title: 'User Dashboard',
            books: Array.isArray(books) ? books : [] // Ensure books is always an array
        });
    } catch (err) {
        console.error('Error fetching books:', err);
        res.render('testinguserdashboard', {
            title: 'User Dashboard',
            books: [], // Send empty array on error
            error: 'Failed to load books. Please try again later.'
        });
    }
});

app.get('/views/userDiscoveryPage', async (req, res) => {
    try {
        const books = await Book.find({}).lean(); // Fetch all books and convert to plain JS objects
        console.log('Books fetched:', books); // Debug log to verify data
        res.render('userDiscoveryPage', {
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

