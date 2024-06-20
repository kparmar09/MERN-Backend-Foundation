import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" })); // To limit the json flow, its a good practice.
app.use(express.urlencoded({ extended: true, limit: "16kb" })); // To grab things from the url, it may be in different encoded forms, this makes sure that it will be uniform.
app.use(express.static("public"));
app.use(cookieParser()); // The server will be able to access and store cookies from the user's browser.

// Routes import:-
import userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.routes.js";
import commentRouter from "./routes/comment.routes.js";
import tweetRouter from "./routes/tweet.routes.js";
import playlistRouter from "./routes/playlist.routes.js";

import healthcheckRouter from "./routes/healthcheck.routes.js";

// Routes declaration:-
app.use("/api/v1/users", userRouter);
app.use("/api/v1/videos", videoRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/playlists", playlistRouter);

app.use("/api/v1/healthcheck", healthcheckRouter);

export { app };
