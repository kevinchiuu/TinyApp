const express = require("express");
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// const urlDatabase = {
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
// };

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234"
  }
};

const getUserByEmail = function(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const userCheck = function(email) {
  for (let userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

//delete this route later on at end of project
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// GET URLS
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: req.cookies["user_id"]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["username"]) {
    const templateVars = {
      user: req.cookies["user_id"]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});

//redirect shortURL to the longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];

  if (!longURL) {
    return res.status('404').send("<h1> Error, Page not found </h1>");
  }

  res.redirect(longURL);
});

//post request to make sure the key-value pair (shortURL: longURL) is added and saved to urlDatabase
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  const {longURL} = req.body;

  urlDatabase[shortURL] = longURL;
  
  //redirect to /urls/:shortURL where shortURL is the random string generated
  res.redirect(`/urls/${shortURL}`);
});

//post request to delete a URL from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;

  delete urlDatabase[shortURL];

  res.redirect('/urls');
});

//post to update the url in the urlDatabase
app.post("/urls/:id", (req, res) => {
  const { longURL } = req.body;

  urlDatabase[req.params.id] = longURL;

  res.redirect('/urls');
});

//displays the login form
app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"]
  };

  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  //extract the email and password from req.body
  const { email, password } = req.body;

  const userFound = getUserByEmail(email);

  if (userFound && userFound.password === password) {
    res.cookie('user_id', userFound.id);

    res.redirect('/urls');

  } else {
    res.status('401').send("<h1> Error wrong user! </h1>");
  }
});

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

//
app.post("/register", (req, res) => {

  const { email, password } = req.body;

  if (email === "" || password === "") {
    return res.status('400').send("<h1> Must enter an email address or password! </h1>");

  } else if (userCheck(email)) {
    return res.status('400').send("<h1> This email is already registered </h1>");

  } else {
    const newUserID = generateRandomString();

    users[newUserID] = {
      id: newUserID,
      email,
      password
    };

    res.cookie('user_id', newUserID);
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});