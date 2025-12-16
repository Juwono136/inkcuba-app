import multer from "multer";
import AppError from "../utils/appError.js";
import { StatusCodes } from "http-status-codes";

// 1. Simpan di Memory (RAM) -> Agar bisa di-resize Sharp
const storage = multer.memoryStorage();

// 2. Filter Tipe File yang Diizinkan
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp", // Gambar
    "application/pdf", // Dokumen
    "application/zip",
    "application/x-zip-compressed", // Source Code
    "video/mp4",
    "video/webm", // Video Preview
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Invalid file type. Only Images, PDF, Zip, and MP4 allowed.",
        StatusCodes.BAD_REQUEST
      ),
      false
    );
  }
};

// 3. Konfigurasi Limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Maksimal 50MB per file
  },
});

export default upload;
