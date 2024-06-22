import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Subscription } from "../models/subscription.model.js";
import mongoose from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const user = req.user;

  const existingSubscription = await Subscription.findOne({
    channel: channelId,
    subscriber: user._id,
  });

  if (existingSubscription) {
    const deleteSubscription = await Subscription.findByIdAndDelete(
      existingSubscription._id
    );
    if (!deleteSubscription) {
      throw new ApiError(500, "Something went wrong while unsubscribing");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Channel unsubscribed successfully"));
  }

  const subscription = await Subscription.create({
    subscriber: user._id,
    channel: channelId,
  });

  if (!subscription) {
    throw new ApiError(
      500,
      "Something went wrong while subscribing to the channel."
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, { subscription }, "Channel subscribed successfully")
    );
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  const channelSubs = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "channelSubscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        channelSubscriber: 1,
      },
    },
  ]);

  if (!channelSubs) {
    throw new ApiError(
      500,
      "Something went wrong while fetching channel subscriber count"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubs,
        "Channel Subscribers fetched successfully"
      )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedChannelInfo",
        pipeline: [
          {
            $project: {
              username: 1,
              fullname: 1,
              email: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        subscribedChannelInfo: 1,
      },
    },
  ]);

  if (!subscribedChannels) {
    throw new ApiError(
      500,
      "Something went wrong while fetching subscribed channels"
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed channels fetched successfully"
      )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
