var express      = require("express");
var app          = express();
var bodyParser   = require("body-parser");
var mongoose     = require("mongoose");
var methodOverride = require("method-override"),
  expressSanitizer = require("express-sanitizer");

//app config
mongoose.connect("mongodb://localhost/blog_app", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());


//mongoose model-config
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date,
               default: Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "test blog",
//     image: "https://images.unsplash.com/photo-1560788991-24aa3054df7b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60",
//     body: "Hello this my first blog"
// });

//Restful routes
app.get("/",function(req,res){
    res.redirect("/blogs");
});

//index route
app.get("/blogs",function(req,res){
    Blog.find({}, function(err, blogs){
        res.render("index", {blogs: blogs});
    });
});

//new route
app.get("/blogs/new",function(req,res){
       res.render("new");
});

//create route
app.post("/blogs", function(req,res){
    //create blog
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            res.render("new");
        } else{
    //then redirect to the index
            res.redirect("/blogs");
        }
    });
});

//show route
app.get("/blogs/:id",(req,res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("show",{blog: foundBlog});
        }
    });
});

//edit route
app.get("/blogs/:id/edit",(req, res)=>{
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            res.redirect("/blogs");
        } else{
            res.render("edit",{blog: foundBlog});
        }
    });
});

//update route
app.put("/blogs/:id", (req,res)=>{
    req.body.blog.body = req.sanitize(req.body.blog.body)
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updateBlog){
        if(err){
            res.redirect("/blogs");
        } else{
            res.redirect("/blogs/" + req.params.id);
        }
    });
});

//delete route
app.delete("/blogs/:id", function(req,res){
   Blog.findByIdAndRemove(req.params.id, function(err){
    if(err){
        res.redirect("/blogs");
    } else{
        res.redirect("/blogs");
    }
});
});


var post = process.env.port || 5000;
app.listen(post, function(){
    console.log("BlogApp is started at "+ post);
});
