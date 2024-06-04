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
import { useErrorHandler, useNotFound, useRateLimiter } from "./middlewares";






dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
initSocket(server);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(useNotFound);
app.use(useErrorHandler);
app.use(cookieParser());
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(useRateLimiter);

// Routes
app.get('/', (req, res) => {
    res.send({ message: "Welcome to typescripty!😁" });
});

//endpoints
app.use("/api/user", userRouter);



// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectToDb();
});
