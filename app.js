console.log('- app.js rest-api-blog1131');

var express = require('express');

var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var app = express();
// set up mongoose
// mongoose.connect("mongodb://localhost/BlogApp");

//Set up mongoose connection


// Hide secret data with nconf
var nconf = require('nconf');
 
nconf.argv().env().file({ file: './rest-api-blog1131/config.json' });


var dev_db_url = nconf.get("DB_URI");

var mongoDB = process.env.MONGODB_URI || dev_db_url;

// var mongoDB = dev_db_url;

mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })

mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// add the middleware libraries into the request handling chain
// app.use(express.static("public"));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
//app.use(express.static("public"));

// create mongoose schema
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
})

// compile into model
var Blog = mongoose.model("Blog", blogSchema);

// create a blog
// Blog.create({
//     title: "Test Blog",
//     image: "https://i.pinimg.com/736x/02/d7/01/02d701b77a984a1b6cf970e6eb0468e1--teacup-maltipoo-maltipoo-puppies.jpg",
//     body: "My first blog is on my dog"
// });

// --------------------------- RESTful routes ---------------------------

// 0 get home / (& redirect to /blogs)
app.get("/", function (req,res) {
	console.log('get home / (& redirect to /blogs)');
res.redirect("/blogs");
});

// 1. INDEX route (get /blogs - View list of blogs)
app.get("/blogs", function(req, res){
	console.log('1. INDEX route (get /blogs - View list of blogs)');
	Blog.find({}, function(err, blogs){
	
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			res.render("index.ejs", {blogs: blogs});
			//res.render("index", {blogs: blogs});
		}
	});
});

// 2. NEW route (Submit blog CREATE FORM)
app.get("/blogs/new", function(req,res){
	console.log('2. NEW route /blogs/new');
  res.render("new.ejs");
})

// 3. CREATE route (Create/Store blog form)
app.post("/blogs", function (req,res) {
	console.log('3. CREATE route /blogs');
  // create blog
	Blog.create(req.body.blog, function (err, newBlog) {
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			// then, redirect
			res.redirect("/blogs");
		}
	})
})

// 4. SHOW route  (get Read/view a blog)
app.get("/blogs/:id", function (req,res) {
	console.log('4. SHOW route /blogs/:id (Read/view a blog)');
	Blog.findById(req.params.id, function (err, foundBlog) {
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			res.render("show.ejs", {blog: foundBlog});
		}
	})
})

// 5. EDIT route (get update/edit form for a blog)
app.get("/blogs/:id/edit", function (req,res) {
	console.log('5. EDIT route (get update/edit form for a blog)');
	Blog.findById(req.params.id, function (err, foundBlog) {
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			res.render("edit.ejs", {blog: foundBlog});
		}
	})
})

// 6. UPDATE route (update selected blog DB)
app.put("/blogs/:id", function (req,res) {
	// Blog.findByIdAndUpdate(id, newData, callback)
	console.log('6. UPDATE route /blogs/:id (update selected blog DB)');
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			res.redirect("/blogs/" + req.params.id);
		}
	})
})

// 7. DESTROY route  (delete selected blog in DB)
app.delete("/blogs/:id", function (req,res) {
	console.log('7. DESTROY route /blogs/:id (delete selected blog in DB)');
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function (err) {
		if(err){
			console.log("OOPS!! Something went wrong.");
		} else {
			// redirect somewhere
			res.redirect("/blogs");
		}
	})
})

app.listen(3000, function () {
    console.log("Listening to port 3000");
})