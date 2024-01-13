require("dotenv").config();
// Module Imports.
const express = require("express"),
  app = express(),
  mongoose = require("mongoose"),
  expressSanitizer = require("express-sanitizer"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override");
const PORT = process.env.PORT || 7000;

//APP CONFIG.

mongoose.connect('mongodb://127.0.0.1:27017/mydb');

var db = mongoose.connection;

db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"))


app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(express.static("public"));
app.use(methodOverride("_method"));

// Importing the models
const Blog = require("./model/blog");
//RESTFUL ROUTES
app.get("/", function (req, res) {
  res.redirect("/blogs");
});
app.get("/blogs", async function (req, res) {
  try {
    const blogs = await Blog.find({});
    res.render("index", { blogs: blogs });
  } catch (err) {
    console.log(err);
    // Handle error here, e.g., send an error response to the client
    res.status(500).send("Internal Server Error");
  }
});

//NEW ROUTE
app.get("/blogs/new", function (req, res) {
  res.render("new");
});
//CREATE ROUTE
app.post("/blogs", function (req, res) {
  // Sanitize to prevent unwanted user input.
  req.body.blog.body = req.sanitize(req.body.blog.body);

  Blog.create(req.body.blog)
    .then(newBlog => {
      console.log("Blog created!");
      res.redirect("/blogs");
    })
    .catch(err => {
      console.error(err);
      res.render("new");
    });
});

// SHOW ROUTE
app.get("/blogs/:id", async function (req, res) {
  try {
    const foundBlog = await Blog.findById(req.params.id);
    res.render("show", { blog: foundBlog });
  } catch (err) {
    console.error(err);
    res.redirect("/blogs");
  }
});

// EDIT ROUTE
app.get("/blogs/:id/edit", async function (req, res) {
  try {
    const foundBlog = await Blog.findById(req.params.id);
    res.render("edit", { blog: foundBlog });
  } catch (err) {
    console.error(err);
    res.redirect("/blogs");
  }
});

// UPDATE ROUTE
app.put("/blogs/:id", async function (req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      req.params.id,
      req.body.blog,
      { new: true } // This option returns the updated document
    );
    res.redirect("/blogs/" + req.params.id);
  } catch (err) {
    console.error(err);
    res.redirect("/blogs");
  }
});

// DELETE ROUTE
app.delete("/blogs/:id", async function (req, res) {
  try {
    await Blog.findOneAndDelete({ _id: req.params.id });
    res.redirect("/blogs");
  } catch (err) {
    console.error(err);
    res.redirect("/blogs");
  }
});


app.listen(PORT, function () {
  console.log(`Server for Blog App has started on ${PORT}`);
});