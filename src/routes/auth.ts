import express from "express";
import AuthController from "../controllers/authController";
import { useAuth } from "../middlewares";
import {
  useLoginRateLimiter,
  useVerifyLimiter,
} from "../middlewares/rateLimiter";
import {
  useLoginSlowDown,
  useVerifySlowDown,
} from "../middlewares/rateSlowDown";

const authRouter = express.Router();

authRouter.post(
  "/login",
  [useLoginRateLimiter, useLoginSlowDown],
  AuthController.login
);

authRouter.post("/logout", [useAuth], AuthController.logout);
authRouter.post("/refresh-token", AuthController.generateRefreshToken);

//MISC
authRouter.get(
  "/verify-email",
  [useAuth, useVerifyLimiter, useVerifySlowDown],
  AuthController.sendEmailToken
);
authRouter.get( 
  "/confirm-email",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.verifyEmailToken
);

authRouter.post(
  "/forgot-password",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.forgotPassword
);

authRouter.post(
  "/reset-password",
  [useVerifyLimiter, useVerifySlowDown],
  AuthController.resetPassword
);

export default authRouter;
