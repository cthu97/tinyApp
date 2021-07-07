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


const users = {
  "user1": {
    id: 'user1',
    email: 'a@a.com',
    password: 'aa'
  },
  'user2': {
    id: 'user2',
    email: 'a@mail.com',
    password: 'a'
  }
}

const UserLogin = (email, password) => {
  const user = findUserEmail(email);
  if (user && user.password ===password){
    return user.id;
  } 
  else{
    return null;
  }
};

const addUser = (email, password) => {
  const userID = generateRandomString();
  users[userID] = {
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
  const templateVars = { user: users[req.cookies['user_id']], urls: urlDatabase };
  res.render('urls_index', templateVars)
});

app.get('/urls/new', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] }
  res.render('urls_new', templateVars)
})

app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.longURL] };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
})

app.get('/register', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render("urls_registration", templateVars);
});

app.get('/login', (req, res) => {
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('urls_login', templateVars)
});

//#########################################################

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send('email/password no blank pls')
  }
  
  const user = findUserEmail(email)
  
  if (user) {
    return res.status(400).send('email already registered')
  }
  
  const userID = addUser(email, password);
  
  res.cookie('user_id', userID)
  res.redirect('/urls')
});

const findUserEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

app.post('/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).send('email/password no blank pls')
  }

  const user = findUserEmail(email);

  if (!user) {
    return res.status(403).send('no user');
  }

  const userID = UserLogin(email, password);

  if (!userID) {
    return res.status(403).send('wrong pw/user')
  }

  res.cookie('user_id', userID)
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
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
