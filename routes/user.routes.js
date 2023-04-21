const fs = require("fs");
const express = require("express");
const uuid = require("uuid").v4;
const HttpError = require("../utils/HttpError");

const router = express.Router();

const { UserModel, PostModel } = require("../model/user.model");
const openai = require("../utils/openai");

const cloudinary = require("../utils/cloudinary");

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
      userId: uuid(),
      fullName: displayName,
      username: displayName.trim(),
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
    const user = await UserModel.findOne({ email: email })
      .populate("posts")
      .sort("-createdAt");
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
  const { email } = req.query;
  try {
    const posts = await PostModel.find({}).sort("-createdAt");

    const postsInJson = JSON.stringify(posts);
    const allPosts = JSON.parse(postsInJson);
    allPosts.map((post) => {
      const userLiked = !!post.likedUsers.find((p) => p === email);
      return (post.userLiked = userLiked);
    });
    res.json({
      status: true,
      message: "All posts",
      data: allPosts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

router.get("/getAllTrendingPosts", async (req, res, next) => {
  const { email } = req.query;

  try {
    const allUsersCount = await UserModel.find({}).countDocuments();
    const trendingLikeCount = Math.round((allUsersCount * 6) / 10);

    const posts = await PostModel.find({ likes: { $gte: trendingLikeCount } })
      .sort("-likes")
      .limit(4);

    const postsInJson = JSON.stringify(posts);
    const allPosts = JSON.parse(postsInJson);
    allPosts.map((post) => {
      const userLiked = !!post.likedUsers.find((p) => p === email);
      return (post.userLiked = userLiked);
    });
    res.json({
      status: true,
      message: "All trending posts",
      data: allPosts,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

router.post("/postNewImage", async (req, res, next) => {
  const { name = "hello welcome to earth", userImage, email, tags } = req.body;
  const aiResponse = await openai.createImage({
    prompt: name,
    n: 1,
    size: "512x512",
    response_format: "url",
  });
  const imageUrl = aiResponse.data.data[0].url;
  let uploadedUrl = imageUrl;
  if (imageUrl) {
    const cloudinaryResponse = await cloudinary.uploader.upload(imageUrl, {
      folder: "/aiultra",
    });
    uploadedUrl = cloudinaryResponse.secure_url;
  }
  try {
    const post = new PostModel({
      postId: uuid(),
      name,
      imageUrl: uploadedUrl,
      userImage,
      email,
      tags,
    });
    await post.save();
    res.json({
      status: true,
      message: "AI generated image successfully",
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

router.post("/postReactImage", async (req, res, next) => {
  const { postId, email, like } = req.body;
  console.log(req.body);
  try {
    const post = await PostModel.findOne({ postId: postId });
    const userALreadyLiked = post.likedUsers.find((u) => u == email);
    if (like) {
      if (userALreadyLiked) {
        return res.json({
          status: true,
          message: "User already liked this image.",
          data: null,
        });
      }
    }
    if (like) {
      post.likes = post.likes + 1;
      post.likedUsers.push(email);
    } else {
      post.likes = post.likes - 1;
      const likedUsers = post.likedUsers.filter((p) => p != email);
      post.likedUsers = likedUsers;
    }
    await post.save();
    res.json({
      status: true,
      message: "Updated likes of image.",
      data: null,
    });
  } catch (error) {
    return next(new HttpError(error, 500));
  }
});

module.exports = router;
