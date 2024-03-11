const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const PORT = 3001;
const SECRET_KEY = 'your-secret-key';

// Dummy database to store user information
const users = [
  { id: 1, username: 'user1', password: 'password1', role: 'user' },
  { id: 2, username: 'admin', password: 'adminpassword', role: 'admin' },
];

// Middleware for token verification
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token not provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  });
};

// Login route - generate and return a token upon successful login
app.post('/login', (req, res) => {
    console.log('reaced with')
    console.log(req.body)
  const { username, password } = req.body;

  const user = users.find(u => u.username === username && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY);
    res.json({ token, user });
  } else {
    res.status(401).json({ message: 'Invalid credentials.' });
  }
});

// Protected route - requires a valid token for access
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'This is a protected route.', user: req.user });
});

// Authorization middleware - checks if the user has the required role
const authorize = (requiredRole) => {
  return (req, res, next) => {
    if (req.user && req.user.role === requiredRole) {
      next();
    } else {
      res.status(403).json({ message: 'Insufficient permissions.' });
    }
  };
};

// Example of using the authorization middleware
app.get('/admin', verifyToken, authorize('admin'), (req, res) => {
  res.json({ message: 'Admin-only route.', user: req.user });
});

app.get('/',(req,res)=>{
    res.json('hello')
})
// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
