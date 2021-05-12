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

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
    return res.status('404').send("Error, Page not found");
  }

  res.redirect(longURL);
});

//makes sure a key-value pair (shortURL: longURL) is added and saved to urlDatabase when receiving POST request
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});