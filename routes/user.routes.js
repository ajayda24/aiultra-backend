const express = require("express");
const uuid = require("uuid").v4;
const HttpError = require("../utils/HttpError");

const router = express.Router();

const UserModel = require("../model/user.model");

router.post("/postUser", async (req, res, next) => {
  const { photoURL, uid, email, displayName, provider } = req.body;
  const existingUser = await UserModel.find({ email: email });
  if (existingUser.length > 0) {
    const sameSocialAuth = existingUser[0].socialAuth.find(
      (u) => u.providerId == provider.providerId
    );
    if (!sameSocialAuth) {
      existingUser[0].socialAuth.push({
        providerId: provider.providerId,
        authId: provider.uid,
        picture: provider.photoURL,
      });
      try {
        await existingUser[0].save();
      } catch (error) {
        return next(new HttpError(error, 500));
      }
      res.json({
        status: true,
        message: "Successfully added another provider to the user.",
        error: null,
      });
    } else {
      res.json({
        status: true,
        message: "Same user exists.",
        error: null,
      });
    }
  } else {
    const user = new UserModel({
      userId: uid,
      fullName: displayName,
      username: displayName,
      email: email,
      userImage: photoURL,
    });
    user.socialAuth.push({
      providerId: provider.providerId,
      authId: provider.uid,
      picture: provider.photoURL,
    });
    try {
      await user.save();
    } catch (error) {
      return next(new HttpError(error, 500));
    }
    res.json({
      status: true,
      message: "Successfully added new user",
      error: null,
    });
  }
});

module.exports = router;
