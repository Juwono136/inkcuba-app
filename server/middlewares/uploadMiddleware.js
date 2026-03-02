import multer from 'multer';

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (JPEG, PNG, WebP, GIF).'), false);
  }
};

export const uploadAvatar = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter,
}).single('avatar');
