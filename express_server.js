const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

const generateRandomString = function() {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// this GET route is used to show the form
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

//redirect shortURL to the longURL
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL];

  if (!longURL) {
    return res.status('404').send("Error, Page not found");
  }

  res.redirect(longURL);
});

//makes sure a key-value pair (shortURL: longURL) is added and saved to urlDatabase when receiving POST request
app.post("/urls", (req, res) => {

  const shortURL = generateRandomString();

  const {longURL} = req.body;

  //console.log(req.body);
  //res.send("Ok");

  urlDatabase[shortURL] = longURL;
  
  //redirect to /urls/:shortURL where shortURL is the random string generated
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});