const express = require("express");
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const { generateRandomString, getUserByEmail, userCheck } = require('./helpers');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

// url database
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "user2@example.com" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "user2@example.com" }
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
    users: req.session["user_id"]
  };

  res.render("login", templateVars);
});

// checks if email and passwords match usersDB email and passwords
app.post("/login", (req, res) => {
  //extract the email and password from req.body
  const { email, password } = req.body;

  const userFound = getUserByEmail(email, users);

  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    req.session['user_id'] = userFound.email;

    res.redirect('/urls');

  } else {
    res.status('401').send("<h1> Error wrong user! </h1>");
  }
});

app.get("/", (req, res) => {
  if (req.session["user_id"]) {
    res.redirect("/urls");

  } else {
    res.redirect("/login");
  }
});

// shows urlDB table
app.get("/urls", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = {
      urls: urlsForUser(req.session["user_id"]),
      users: req.session["user_id"]
    };
    res.render("urls_index", templateVars);

  } else {
    res.redirect("/login");
  }
});

// create new TinyURL route
app.get("/urls/new", (req, res) => {
  if (req.session["user_id"]) {
    const templateVars = {
      users: req.session["user_id"]
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// after a user creaters a new url, the route will be redirected to the urls page
app.get("/urls/:shortURL", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;
    const templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      users: req.session["user_id"]
    };
    res.render("urls_show", templateVars);
  } else {
    res.status('404').send("<h1> Error </h1>");
  }
});

// redirect shortURL to the longURL
app.get("/u/:id", (req, res) => {

  if (!req.session["user_id"]) {
    return res.status('404').send("<h1> Error, Page not found </h1>");
  }

  const longURL = urlDatabase[req.params.id].longURL;

  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status('401').send("<h1> Error page doesnt exist! </h1>");
  }
});

// make sure the new shortURL created is added and saved to urlDatabase
// only registered users can create their own shortURLs
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();

  const {longURL} = req.body;

  urlDatabase[shortURL] = {
    longURL,
    userID: req.session["user_id"]
  };
  
  //redirect to /urls/:shortURL where shortURL is the random string generated
  res.redirect(`/urls/${shortURL}`);
});

// delete a URL from the urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session["user_id"]) {
    const shortURL = req.params.shortURL;

    delete urlDatabase[shortURL];
  
    res.redirect('/urls');

  } else {
    res.redirect("/login");
  }
});

//update the url in the urlDatabase
app.post("/urls/:id", (req, res) => {
  if (req.session["user_id"]) {
    const { longURL } = req.body;

    urlDatabase[req.params.id].longURL = longURL;
  
    res.redirect('/urls');
  } else {
    res.status('400').send("<h1> user is not logged in </h1>");
  }
});

// after a user is logged out, clear all cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//register users
app.get("/register", (req, res) => {
  const templateVars = {
    users: req.session["user_id"],
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

    req.session['user_id'] = email;
    res.redirect("/urls");
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});