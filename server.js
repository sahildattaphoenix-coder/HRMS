const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('src/assets/db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Custom auth endpoint
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = router.db; // Get the database
  const users = db.get('users').value();

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    // Return sanitized user without password
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      token: 'mock-jwt-token-' + user.id,
      user: userWithoutPassword
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
  console.log('Custom auth endpoint: POST /auth/login');
});
