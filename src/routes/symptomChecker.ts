import express from "express";
import { SymptomsChecker } from "../controllers";
import { useAuth, useCheckRole } from "./../middlewares";

const symptomsCheckerRouter = express.Router();

symptomsCheckerRouter.post(
  "/",
  [useAuth, useCheckRole("user")],
  SymptomsChecker.checkSymptoms
);

export default symptomsCheckerRouter;
