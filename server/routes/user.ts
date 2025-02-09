import express from "express";

const router = express.Router();

import * as userController from "../controllers/user";

router.post("/create", userController.createUserController);
router.post("/update", userController.updateUserController);
router.post("/trade", userController.tradeController);
router.post("/settle", userController.settleController);
router.post("/get-swipe-cards", userController.getSwipeCardsController);

router.get("/tsx/:id", userController.getTransactionDetailsController);
router.get(
  "/transactions/:id",
  userController.getAllUserTransactionsController
);

router.get("/:id", userController.getUserByIdController);
router.get("/email/:email", userController.getUserByEmailController);

export default router;
