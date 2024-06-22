import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const user = req.user;

  if (!name || !description) {
    throw new ApiError(400, "Please pass in name and description");
  }
  if ([name, description].some((field) => field?.trim() === "")) {
    throw new ApiError(401, "Please do not leave the fields empty");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: user._id,
  });

  if (!playlist) {
    throw new ApiError(
      400,
      "Something went wrong while creating your playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const playlist = await Playlist.find({ owner: userId });

  if (!playlist.length) {
    throw new ApiError(
      400,
      "User Id does not exist or something went wrong while fetching the playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "User Playlists fetched"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(
      500,
      "Playlist with this id does not exist or something went wrong while fetching the playlist"
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { playlist }, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const user = req.user;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while fetching playlist details"
    );
  }

  if (!user._id.equals(playlist.owner)) {
    throw new ApiError(
      400,
      "You cannot add videos to a playlist created by another user"
    );
  }

  const existingVideos = playlist.videos;
  existingVideos.push(videoId);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: existingVideos,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while adding your video to the playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedPlaylist },
        "Video added to the playlist successfully"
      )
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  const user = req.user;

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(
      500,
      "Something went wrong while fetching playlist details"
    );
  }

  if (!user._id.equals(playlist.owner)) {
    throw new ApiError(
      400,
      "You cannot remove videos from a playlist created by another user"
    );
  }

  let existingVideos = playlist.videos;
  existingVideos = existingVideos.filter((id) => id != videoId);

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        videos: existingVideos,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(
      500,
      "Something went wrong while adding your video to the playlist"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { updatedPlaylist },
        "Video removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const user = req.user;

  const existingPlaylist = await Playlist.findById(playlistId);
  if (!existingPlaylist) {
    throw new ApiError(
      500,
      "Playlist with the id does not exist or something went wrong while fetching playlist data"
    );
  }
  if (!user._id.equals(existingPlaylist.owner)) {
    throw new ApiError(
      400,
      "You cannot delete a playlist created by a diffrent user"
    );
  }

  const isPlaylistDeleted = await Playlist.findByIdAndDelete(playlistId);
  if (!isPlaylistDeleted) {
    throw new ApiError(400, "Something went wrong while deleting the playlist");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const user = req.user;

  const existingPlaylist = await Playlist.findById(playlistId);
  if (!existingPlaylist) {
    throw new ApiError(
      500,
      "Playlist with the id does not exist or something went wrong while fetching playlist data"
    );
  }
  if (!user._id.equals(existingPlaylist.owner)) {
    throw new ApiError(
      400,
      "You cannot modify a playlist created by a diffrent user"
    );
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: {
        name: name,
        description: description,
      },
    },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiError(500, "Something went wrong while updating the playlist");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { updatedPlaylist }, "Playlist updated successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
