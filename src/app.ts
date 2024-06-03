import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
// Middleware
app.use(morgan('dev'));

// Routes
app.get('/', (req, res) => {
    res.send({ message: "Welcome to typescripty!😁" });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
