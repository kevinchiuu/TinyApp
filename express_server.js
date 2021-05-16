const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, userCheck } = require('./helpers');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// url database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

//users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", saltRounds)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("1234", saltRounds)
  }
};

const urlsForUser = function(id) {
  let userDB = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userDB[url] = {
        longURL: urlDatabase[url].longURL
      };
    }
  }

  return userDB;
};

//displays the login form
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };

  res.render("login", templateVars);
});

// checks if email and passwords match usersDB email and passwords
app.post("/login", (req, res) => {
  //extract the email and password from req.body
  const { email, password } = req.body;

  const userFound = getUserByEmail(email, users);

  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    res.cookie('user_id', userFound.id);

    res.redirect('/urls');

  } else {
    res.status('401').send("<h1> Error wrong user! </h1>");
  }
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// shows urlDB table
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {
      //urls: urlsForUser(req.cookies["user_id"]),
      urls: urlDatabase,
      user: req.cookies["user_id"]
    };
    res.render("urls_index", templateVars);

  } else {
    res.redirect("/login");
  }
});

// create new TinyURL route
app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    const templateVars = {
      user: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// after a user creaters a new url, the route will be redirected to the urls page
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: req.cookies["user_id"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
});

//redirect shortURL to the longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;

  if (!longURL) {
    return res.status('404').send("<h1> Error, Page not found </h1>");
  }

  res.redirect(longURL);
});

//make sure the key-value pair (shortURL: longURL) is added and saved to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  const {longURL} = req.body;

  urlDatabase[shortURL] = longURL;
  
  //redirect to /urls/:shortURL where shortURL is the random string generated
  res.redirect(`/urls/${shortURL}`);
});

//post request to delete a URL from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"]) {
    const shortURL = req.params.shortURL;

    delete urlDatabase[shortURL];
  
    res.redirect('/urls');

  } else {
    res.redirect("/login");
  }
});

//post to update the url in the urlDatabase
app.post("/urls/:id", (req, res) => {
  const { longURL } = req.body;

  urlDatabase[req.params.id].longURL = longURL;

  console.log(longURL);
  console.log(urlDatabase);

  res.redirect('/urls');
});

// after a user is logged out, clear all cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/login");
});

//register route
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],

  };
  
  res.render("register", templateVars);
});

// add user to the userdb.
// if user already exists inside the user db, then a message will be printed out accordingly
app.post("/register", (req, res) => {

  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status('400').send("<h1> Must enter an email address or password! </h1>");

  } else if (userCheck(email, users)) {
    return res.status('400').send("<h1> This email is already registered </h1>");

  } else {
    const newUserID = generateRandomString();

    users[newUserID] = {
      id: newUserID,
      email,
      password: bcrypt.hashSync(password, saltRounds)
    };

    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});