import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getSubscribedChannels,
  getUserChannelSubscribers,
  toggleSubscription,
} from "../controllers/subscription.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/:channelId").post(toggleSubscription);

router.route("/subs/:channelId").get(getUserChannelSubscribers);
router.route("/channels/:subscriberId").get(getSubscribedChannels);

export default router;
