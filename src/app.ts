import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectToDb } from "./utils";
import http from "http";
import { initSocket } from "./sockets/socket.service";
import { userRouter } from './routes';
import { useErrorHandler, useNotFound, useRateLimiter } from "./middlewares/";






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
  connectToDb();
});
