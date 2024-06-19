import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getVideoById,
  publishAVideo,
  updateVideo,
} from "../controllers/video.controller.js";

const router = Router();

router.route("/publish").post(
  verifyJWT,
  upload.fields([
    {
      name: "videoFile",
      maxCount: 1,
    },
    {
      name: "thumbnail",
      maxCount: 1,
    },
  ]),
  publishAVideo
);

router.route("/video/:videoId").get(getVideoById);
router
  .route("/update-video/:videoId")
  .post(verifyJWT, upload.single("thumbnail"), updateVideo);

export default router;
