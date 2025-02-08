import { RequestHandler } from "express";

import {
  ControllerHelper,
  ParameterLessControllerHelper,
} from "../utils/controllerHelper";
import { SCOPE } from "../utils/enums";
import * as UserService from "../services/index";
import * as ZodSchemas from "../db/zodSchemaAndTypes";

export const createUserController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Create User",
    serviceMethod: UserService.createUser,
    scope: SCOPE.USER,
    validationSchema: ZodSchemas.userInsertSchema,
    validationData: req.body,
  });
};

export const updateUserController: RequestHandler = async (req, res) => {
  await ControllerHelper({
    res,
    logMessage: "Update User",
    serviceMethod: UserService.updateUser,
    scope: SCOPE.USER,
    validationSchema: ZodSchemas.userUpdateSchema,
    validationData: req.body,
  });
};

export const getUserByIdController: RequestHandler = async (req, res) => {
  const id = req.params.id;

  await ParameterLessControllerHelper({
    res,
    logMessage: "Get User by ID",
    serviceMethod: () => UserService.getUserById(id),
    scope: SCOPE.USER,
  });
};

export const getUserByEmailController: RequestHandler = async (req, res) => {
  const email = req.params.email;

  await ParameterLessControllerHelper({
    res,
    logMessage: "Get User by Email",
    serviceMethod: () => UserService.getUserByEmail(email),
    scope: SCOPE.USER,
  });
};
