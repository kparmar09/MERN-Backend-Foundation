import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Please fill the content field");
  }
  if (content.trim() === "") {
    throw new ApiError(400, "Content cannot be left empty");
  }

  const tweet = await Tweet.create({
    content,
    owner: user._id,
  });

  if (!tweet) {
    throw new ApiError(500, "Something went wrong while creating your tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { tweet }, "Tweet created successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const user = req.user;

  const tweets = await Tweet.find({ owner: user._id });

  if (!tweets) {
    return ApiError(
      400,
      "Something went wrong while fetching all tweets associated to the current user"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweets },
        "Tweets fetched associated to the current user"
      )
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tweetId } = req.params;
  const { contentToUpdate } = req.body;

  const existingTweet = await Tweet.findById(tweetId);
  if (!existingTweet) {
    throw new ApiError(400, "Tweet with this id does not exist");
  }

  if (!user._id.equals(existingTweet.owner)) {
    throw new ApiError(400, "Cannot modify a tweet made by another user");
  }
  if (!contentToUpdate) {
    throw new ApiError(400, "Please fill the content field");
  }
  if (contentToUpdate.trim() === "") {
    throw new ApiError(400, "Content cannot be left empty");
  }

  const updatedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content: contentToUpdate,
      },
    },
    { new: true }
  );

  if (!updatedTweet) {
    throw new ApiError(500, "Something went wrong while updating your tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { updatedTweet }, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const user = req.user;
  const { tweetId } = req.params;

  const existingTweet = await Tweet.findById(tweetId);

  if (!existingTweet) {
    throw new ApiError(400, "Tweet with this id does not exist");
  }

  if (!user._id.equals(existingTweet.owner)) {
    throw new ApiError(400, "Cannot delete a tweet made by another user");
  }

  const isTweetDeleted = await Tweet.findByIdAndDelete(tweetId);
  if (!isTweetDeleted) {
    throw new ApiError(500, "Something went wrong while deleting your tweet");
  }

  return res.status(200, {}, "Tweet deleted successfully");
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
