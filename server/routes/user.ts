import express from "express";

const router = express.Router();

import * as userController from "../controllers/user";

router.get("/get-token", userController.getTokenController);

export default router;
