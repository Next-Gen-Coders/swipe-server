import { RequestHandler } from "express";

import { ParameterLessControllerHelper } from "../utils/controllerHelper";
import { SCOPE } from "../utils/enums";

import * as UserService from "../services/index";

export const getTokenController: RequestHandler = async (req, res) => {
  await ParameterLessControllerHelper({
    res,
    logMessage: "Get Token",
    serviceMethod: UserService.getToken,
    scope: SCOPE.USER,
  });
};
