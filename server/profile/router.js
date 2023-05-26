const express = require("express");
const { auth } = require("../middleware/middleware");
const { getCurrentUserProfile, getProfile } = require("./controller/index");
const profileRouter = express.Router();
profileRouter.get("/profile", auth, getCurrentUserProfile);
profileRouter.get("/profile/:id", getProfile);
module.exports = { profileRouter: profileRouter };
