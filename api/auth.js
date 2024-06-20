"use strict";

const { Router } = require("express");
const { register, verifytoken, createProfile } = require("../controller/user");
const authMiddleware = require("../middlewares/AuthMiddleWare");

class AuthAPI {
  constructor() {
    this.router = Router();
    this.setupRoutes();
  }

  setupRoutes() {
    const router = this.router;
    router.post("/register", register);
    router.post("/verify-token", verifytoken);
    router.post("/create-profile", authMiddleware(), createProfile);
  }

  getRouter() {
    return this.router;
  }

  getRouterGroup() {
    return "/auth";
  }
}

module.exports = AuthAPI;
