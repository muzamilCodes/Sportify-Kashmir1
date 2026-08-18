const multer = require("multer");
const path = require("path");
const fs = require("fs");

let storage;
try {
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  fs.accessSync(uploadDir, fs.constants.W_OK);

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
} catch (err) {
  console.warn("⚠️ Local disk uploads directory not writable (serverless/Vercel environment). Switching to memory storage.");
  storage = multer.memoryStorage();
}

const fileFilter = (req, file, cb) => {
  const allowedExtensions = new Set([".jpeg", ".jpg", ".png", ".webp"]);
  const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const extname = allowedExtensions.has(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedMimeTypes.has(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

module.exports = upload;
