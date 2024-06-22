import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const commentAggregate = await Comment.aggregate([
    { $match: { video: new mongoose.Types.ObjectId(videoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerInfo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullname: 1,
              email: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: {
        path: "$ownerInfo",
        preserveNullAndEmptyArrays: true,
      },
    },
  ]);

  if (!commentAggregate.length) {
    throw new ApiError(
      400,
      "Invalid video id or something went wrong while fetching comments"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { commentAggregate },
        "Comments to the requested video fetched"
      )
    );
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;
  const user = req.user;

  if (!content) {
    throw new ApiError(400, "Please pass something in comment");
  }
  if (content.trim() === "") {
    throw new ApiError(400, "Please fill out the content field");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(
      400,
      "Invalid video id or something went wrong while fetching video details"
    );
  }

  const comment = await Comment.create({
    content,
    video: video?._id,
    owner: user?._id,
  });

  if (!comment) {
    throw new ApiError(500, "Something went wrong while adding your comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { comment }, "Comment added successfully."));
});

const updateComment = asyncHandler(async (req, res) => {
  const { contentToUpdate } = req.body;
  const { commentId } = req.params;
  const user = req.user;

  const existingComment = await Comment.findById(commentId);

  if (!existingComment) {
    throw new ApiError(
      400,
      "Incorrect comment id or something went wrong while fetching comment details"
    );
  }

  if (!user._id.equals(existingComment.owner)) {
    throw new ApiError(
      401,
      "Only the owner who created the comment can update it"
    );
  }

  if (!contentToUpdate) {
    throw new ApiError(400, "Please pass something in comment");
  }
  if (contentToUpdate.trim() === "") {
    throw new ApiError(400, "Please fill out the content field");
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: {
        content: contentToUpdate,
      },
    },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(500, "Something went wrong while updating your comment");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedComment }, "Comment updated successfully")
    );
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const user = req.user;

  const existingComment = await Comment.findById(commentId);
  if (!existingComment) {
    throw new ApiError(
      400,
      "Incorrect comment id or something went wrong while fetching comment details"
    );
  }

  if (!user._id.equals(existingComment.owner)) {
    throw new ApiError(
      401,
      "Only the owner who created the comment can delete it"
    );
  }

  const isCommentDeleted = await Comment.findByIdAndDelete(commentId);
  if (!isCommentDeleted) {
    throw new ApiError(500, "Something went wrong while deleting the comment");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
