import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
} from "../controllers/playlist.controller.js";

const router = Router();

router.use(verifyJWT);

router.route("/create").post(createPlaylist);
router.route("/:userId").get(getUserPlaylists);
router.route("/:playlistId").get(getPlaylistById);
router.route("/update/:playlistId").patch(updatePlaylist);
router.route("/delete/:playlistId").delete(deletePlaylist);

export default router;
