const express = require('express');
const routes = require('./routes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port : ${port}`);
});
