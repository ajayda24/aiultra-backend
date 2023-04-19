const express = require("express");
const uuid = require("uuid").v4;
const HttpError = require("../utils/HttpError");

const router = express.Router();

const { UserModel, PostModel } = require("../model/user.model");
// const PostModel = require("../model/post.model");

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
        data: null,
      });
    } else {
      res.json({
        status: true,
        message: "Same user exists.",
        data: null,
      });
    }
  } else {
    const user = new UserModel({
      userId: uid,
      fullName: displayName,
      username: displayName.trim(),
      email: email,
      userImage: photoURL,
    });
    console.log(user);
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
      data: null,
    });
  }
});

router.get("/getUser", async (req, res, next) => {
  const { email = "ajay24daniel@gmail.com" } = req.body;
  try {
    const user = await UserModel.findOne({ email: email });
    // .populate("posts")
    // .populate({ path: "likedPosts", match: { $in: [email] } });
    if (!user) {
      return next(new HttpError("No user found", 500));
    }
    res.json({
      status: true,
      message: "Logged In user details.",
      data: user,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});
router.get("/getUserPosts", async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await UserModel.findOne({ email: email }).populate("posts");
    const userPosts = user.toObject();

    const updatedPosts = userPosts.posts.map((post) => {
      const userLiked = !!post.likedUsers.find((p) => p === email);
      return { ...post, userLiked: userLiked };
    });

    if (!user) {
      return next(new HttpError("No user found", 500));
    }
    res.json({
      status: true,
      message: "Logged In user posts.",
      data: updatedPosts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});
router.get("/getUserLikedPosts", async (req, res, next) => {
  const { email } = req.query;
  try {
    const user = await UserModel.findOne({ email: email }).populate({
      path: "likedPosts",
      match: { $in: [email] },
    });

    const userPosts = user.toObject();
    const updatedPosts = userPosts.likedPosts.map((post) => {
      const userLiked = !!post.likedUsers.find((p) => p === email);
      return { ...post, userLiked: userLiked };
    });
    if (!user) {
      return next(new HttpError("No user found", 500));
    }
    res.json({
      status: true,
      message: "Logged In user liked posts.",
      data: updatedPosts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

router.get("/getAllPosts", async (req, res, next) => {
  try {
    const posts = await PostModel.find({}).sort("-createdAt");
    res.json({
      status: true,
      message: "All posts",
      data: posts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

router.get("/getAllTrendingPosts", async (req, res, next) => {
  try {
    const posts = await PostModel.find({ likes: { $gt: 2 } }).sort(
      "-createdAt"
    );
    res.json({
      status: true,
      message: "All posts",
      data: posts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

module.exports = router;
