const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser')


app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
}

const findUserEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email===email){
      return user;
    }
  }
  return null;
}

const users = {
  "user1": {
    id: 'user1',
    email: 'a@a.com',
    password: 'pw'
  },
  'user2': {
    id: 'user2',
    email: 'a@mail.com',
    password: 'pwpw'
  }
}

const addUser = (email, password) => {
  const userID = generateRandomString();
  user[userID]= {
    id: userID,
    email,
    password,
  }
  return userID
}

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.ca',
};

app.get('/', (req, res) => {
  res.redirect('/urls')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars)
})

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.longURL] };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_registration", templateVars);
});

//#########################################################

app.post('/register', (req, res) => {
  const {email, password} = req.body;
  const userID = addUser(email, password);
  res.cookie('userID', userID)
  res.render('urls_registration')
})

app.post('/login', (req, res) => {
  const username = req.body.name;
  res.cookie('username', username)
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect('/urls')
});

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls')
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
