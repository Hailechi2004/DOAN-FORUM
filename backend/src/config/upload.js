const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directories exist
const uploadDir = path.join(__dirname, "../../uploads");
const dirs = ["avatars", "posts", "messages", "files"];

dirs.forEach((dir) => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "files";
    if (req.baseUrl && req.baseUrl.includes("/avatar")) folder = "avatars";
    else if (req.baseUrl && req.baseUrl.includes("/posts")) folder = "posts";
    else if (req.baseUrl && req.baseUrl.includes("/messages"))
      folder = "messages";

    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes =
    /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images and documents are allowed."));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;
