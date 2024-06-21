import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.model.js";
import mongoose from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const user = req.user;

  const existingLikeStatus = await Like.findOne({ video: videoId });
  if (existingLikeStatus) {
    const deleteLike = await Like.findByIdAndDelete(existingLikeStatus._id);
    if (!deleteLike) {
      throw new ApiError(500, "Something went wrong while disliking");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Video disliked successfully"));
  }

  const createLike = await Like.create({
    video: videoId,
    likedBy: user._id,
  });

  if (!createLike) {
    throw new ApiError(500, "Something went wrong while liking the video");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { createLike }, "Video liked successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const user = req.user;

  const existingLikeStatus = await Like.findOne({ comment: commentId });
  if (existingLikeStatus) {
    const deleteLike = await Like.findByIdAndDelete(existingLikeStatus._id);
    if (!deleteLike) {
      throw new ApiError(500, "Something went wrong while disliking");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Comment disliked successfully"));
  }

  const createLike = await Like.create({
    comment: commentId,
    likedBy: user._id,
  });

  if (!createLike) {
    throw new ApiError(500, "Something went wrong while liking the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { createLike }, "Comment liked successfully"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const user = req.user;

  const existingLikeStatus = await Like.findOne({ tweet: tweetId });
  if (existingLikeStatus) {
    const deleteLike = await Like.findByIdAndDelete(existingLikeStatus._id);
    if (!deleteLike) {
      throw new ApiError(500, "Something went wrong while disliking");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Tweet disliked successfully"));
  }

  const createLike = await Like.create({
    tweet: tweetId,
    likedBy: user._id,
  });

  if (!createLike) {
    throw new ApiError(500, "Something went wrong while liking the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { createLike }, "Tweet liked successfully"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  //TODO: get all liked videos

  const user = req.user;

  const likedVideosAggregate = await Like.aggregate([
    {
      $match: {
        comment: null,
        tweet: null,
        likedBy: new mongoose.Types.ObjectId(user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              views: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        likedBy: 1,
        video: 1,
      },
    },
  ]);

  if (!likedVideosAggregate) {
    throw new ApiError(
      500,
      "Something went wrong while fetching user liked videos"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        likedVideosAggregate,
        "Liked videos fetched successfully"
      )
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
