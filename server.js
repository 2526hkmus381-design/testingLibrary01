const uri = "mongodb+srv://renderDeploy:renderDeploy@cluster0.nuoxsbu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const express = require('express');
const bodyParser = require('body-parser');
//const client = new MongoClient(uri);
const dbName ="testingLibrary";
const userCollection = "userCollection";
const path = require('path');
const mongoose = require('mongoose');
const app = express();
const port = process.env.PORT || 8099;
let db; ///NEW

app.use(express.static(path.join(__dirname, '1')));

// Connect to MongoDB
mongoose.connect(uri)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));



// User Schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    name: String
});

const User = mongoose.model('User', userSchema);

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

// Server main page
//app.get('/', (req, res) => {
//    res.sendFile(path.join(__dirname, '1', 'index.html'));
//});

// Server login page
//app.get('/', (req, res) => {
 // res.sendFile(path.join(__dirname, '1', 'user-dashboard.html'));
//});

// Server login page
app.post('/login', async (req, res) => {
  const{username, password}= req.body;
  if(!db){
    return res.status(500).send("Database not connected");
  }

  try{
    //const collection = db.Collection(userCollection);
    const user = await User.findOne({ username, password });
    if(user && user.role=="user"){
      res.redirect("/user-dashboard.html");
    }else {
      res.send("Invalid username or password. <a href="/">Try again</a>');");
    }
  
  }catch (err){
    console.error("Error querying database:", err);
    res.status(500).send('Server error');
  }
});

// Server user dashboard
app.get('/user-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '1', 'user-dashboard.html'));
});

// Server admin dashboard
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '1', 'admin-dashboard.html'));
});

app.listen(port, () => {
  console.log(`*`)
})

