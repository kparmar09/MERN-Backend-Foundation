import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import fs from "fs";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "There should be no empty fields");
  }

  const owner = req.user;
  if (!owner) {
    throw new ApiError(400, "Unauthorized Access. Please login");
  }

  const videoFileLocalPath = req.files?.videoFile[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
  if (!videoFileLocalPath || !thumbnailLocalPath) {
    throw new ApiError(401, "Please upload both thumbnail and video files");
  }
  console.log(videoFileLocalPath, thumbnailLocalPath);

  const videoFile = await uploadOnCloudinary(videoFileLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!videoFile || !thumbnail) {
    throw new ApiError(
      500,
      "Something went wrong while uploading your files to cloudinary"
    );
  }

  console.log(videoFile);

  const video = await Video.create({
    videoFile: videoFile?.url || "",
    thumbnail: thumbnail?.url || "",
    title,
    description,
    duration: videoFile?.duration || 0,
    owner,
  });

  const createdVideo = await Video.findById(video._id);

  if (!createdVideo) {
    throw new ApiError(
      500,
      "Something went wrong while registering the video in db"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { createdVideo }, "Video registered successfully.")
    );
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(401, "Video with this id does not exist.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { video }, "Video fetched successfully"));
});

const updateVideo = asyncHandler(async (req, res) => {
  // Data from frontend & middlewares:-
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;
  const loggedInUserId = req.user._id;

  // VideoId and User verification:-
  const isVideoIdCorrect = await Video.findById(videoId);
  if (!isVideoIdCorrect) {
    fs.unlinkSync(thumbnailLocalPath);
    throw new ApiError(400, "There is no video with the given video id.");
  }

  if (!loggedInUserId.equals(isVideoIdCorrect.owner)) {
    fs.unlinkSync(thumbnailLocalPath);
    throw new ApiError(
      400,
      "You cannot modify a video created by another user"
    );
  }

  // Incoming Data Verification:-
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Please provide a thumbnail image");
  }

  //   // Remove the existing image from cloudinary:-
  //   const existingThumbnailUrl = await Video.findOne(thumbnail);
  //   console.log(existingThumbnailUrl);

  // Uploading the new image on cloudinary:-
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  if (!thumbnail) {
    throw new ApiError(500, "Error while uploading thumbnail on cloudinary");
  }

  // db entry:-
  const video = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title: title,
        description: description,
        thumbnail: thumbnail?.url || "",
      },
    },
    { new: true }
  );

  if (!video) {
    throw new ApiError(
      500,
      "Something went wrong while updating the video details"
    );
  }

  // return
  return res
    .status(200)
    .json(
      new ApiResponse(200, { video }, "Video details updated successfully")
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  // VideoId verification:-
  const isVideoIdCorrect = await Video.findById(videoId);
  if (!isVideoIdCorrect) {
    throw new ApiError(400, "There is no video with the given video id.");
  }

  // User verification:-
  const loggedInUserId = req.user._id;
  if (!loggedInUserId.equals(isVideoIdCorrect.owner)) {
    throw new ApiError(
      400,
      "You cannot delete a video created by another user"
    );
  }

  // Delete from db:-
  const deletedVideo = await Video.findByIdAndDelete(videoId).select("_id");
  if (!deletedVideo) {
    throw new ApiError(
      400,
      "Something went wrong while deleting the video or the video id is invalid."
    );
  }

  // return
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "The document with the provided video id was successfully deleted"
      )
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const loggedInUser = req.user._id;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(500, "There is no video with the given video id");
  }
  if (!loggedInUser.equals(video.owner)) {
    throw new ApiError(
      400,
      "You cannot toggle publish status of a video created by another user"
    );
  }

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { video }, "Publish Status toggled successfully")
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
