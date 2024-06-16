import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    const uniquePrefix = Math.round(Math.random() * 1e6);
    cb(null, uniquePrefix + "-" + file.originalname);
  },
});

export const upload = multer({ storage: storage });
