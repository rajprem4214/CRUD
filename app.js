const express = require("express");
const res = require("express/lib/response");
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const expressValidator = require('express-validator');
const flash = require('express-session');
const session = require('express-session');

 
mongoose.connect("mongodb://localhost/nodekb");
let db = mongoose.connection;

//check connection
db.once("open", () => {
  console.log("Connected to mongodb");
});

//check db errorr
db.on("error", (err) => {
  console.log(err);
});

//Init app
const app = express();

//Bring In models
let Article = require("./models/article");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use("/static", express.static('./static/'));
//Set public folder
app.use(express.static(path.join(__dirname, "public")));

//load home page
app.get("/", (req, res) => {
  Article.find({}, (err, articles) => {
    if (err) {
      console.log(err);
    } else {
      res.render("index", {
        title: "Welcome To My CRUD App",
        articles: articles,
      });
    }
  });
});
//get single article
app.get('/article/:id', (req, res)=>{
  Article.findById(req.params.id , (err, article)=>{
      res.render('article',{
        article:article
      })
  })
})
//Add Article
app.get("/articles/add", (req, res) => {
  res.render("add_article", {
    title: "Add Article",
  });
});


//Load Edit Form
app.get("/article/edit/:id", (req, res) => {
  Article.findById(req.params.id, (err, article) => {
    res.render("edit_article", {
      title:'Edit Article',
      article: article
    });
  });
});


//Add submit
app.post("/articles/add", (req, res) => {
  let article = new Article();
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  article.save((err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect("/");
    }
  });
});

//express srssion middleware
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}))


//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
 





//Update Submit Post Route
app.post("/articles/edit/:id", (req, res) => {
  let article = {};
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;

  let query ={_id:req.params.id}

  Article.update(query, article,(err) => {
    if (err) {
      console.log(err);
      return;
    } else {
      res.redirect("/");
    }
  });
});


app.delete('/article/:id', (req,res)=>{
     let query = {_id:req.params.id}

     Article.remove(query, (err)=>{
       if(err){
         console.log(err);

       }
       res.send('Success');
     })
})

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
