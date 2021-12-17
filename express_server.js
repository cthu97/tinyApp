const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");

const {
  getUserByEmail,
  generateRandomString,
  UserLogin,
  urlsForUser, urlDatabase, users
} = require("./helpers.js");

app.set("view engine", "ejs");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  cookieSession({
    name: "session",
    keys: ["keeeyone", "keeotowo", "fhtheireie"],
  })
);

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    const usersURLs = urlsForUser(templateVars.user.id, urlDatabase);
    templateVars.urls = usersURLs;
    res.render("urls_index", templateVars);
  } else {
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("URL not found!");
  }
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userID: urlDatabase[req.params.shortURL].userID,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("Website not found!");
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newID = generateRandomString();

  if (!email || !password) {
    res
      .status(400)
      .send(
        "Please fill out required fields. \n <a href='/register'> Try again </a> "
      );
  } else if (getUserByEmail(users, email)) {
    res
      .status(400)
      .send(
        "This email is already registered. \n <a href='/login'> Login </a>"
      );
  } else {
    users[newID] = {
      id: newID,
      email,
      password: hashedPassword,
    };
  }
  req.session["user_id"] = newID;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(users, email);
  const userID = UserLogin(email, password);

  if (!email || !password) {
    return res
      .status(400)
      .send(
        "email/password no blank pls. Please <a href='/login'> login again. </a>"
      );
  }

  if (!user) {
    return res
      .status(403)
      .send("No such user exists. Please <a href='/login'> login again. </a>");
  }

  if (!userID) {
    return res
      .status(403)
      .send("wrong pw/user. Please <a href='/login'> login again. </a>");
  }

  req.session.user_id = userID;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(401).send("Unable to delete URL: account not creator");
  }
});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.status(401).send("Unable to use URL: account not creator");
  }
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: users[req.session.user_id].id,
  };
  res.redirect(`/urls/${shortURL}`);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
