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

const MAX_CSV_SIZE = 5 * 1024 * 1024; // 5MB
const CSV_EXCEL_MIMES = [
  'text/csv',
  'application/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const csvFileFilter = (req, file, cb) => {
  const name = (file.originalname || '').toLowerCase();
  const ok =
    CSV_EXCEL_MIMES.includes(file.mimetype) ||
    name.endsWith('.csv') ||
    name.endsWith('.xlsx') ||
    name.endsWith('.xls');
  if (ok) cb(null, true);
  else cb(new Error('Only CSV or Excel (.csv, .xlsx, .xls) files are allowed.'), false);
};

export const uploadStudentList = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_CSV_SIZE },
  fileFilter: csvFileFilter,
}).single('studentList');

// Portfolio: images up to 10MB, PDF up to 20MB
const MAX_PORTFOLIO_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_PORTFOLIO_PDF = 20 * 1024 * 1024;   // 20MB
const PORTFOLIO_IMAGE_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const PORTFOLIO_PDF_MIMES = ['application/pdf'];

const portfolioImageFilter = (req, file, cb) => {
  if (PORTFOLIO_IMAGE_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PNG, JPG images up to 10MB are allowed.'), false);
};

const portfolioPdfFilter = (req, file, cb) => {
  if (PORTFOLIO_PDF_MIMES.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only PDF up to 20MB is allowed.'), false);
};

export const uploadPortfolioScreenshot = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_PORTFOLIO_IMAGE },
  fileFilter: portfolioImageFilter,
}).single('screenshot');

export const uploadPortfolioPoster = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_PORTFOLIO_IMAGE },
  fileFilter: portfolioImageFilter,
}).single('poster');

export const uploadPortfolioReport = multer({
  storage: memoryStorage,
  limits: { fileSize: MAX_PORTFOLIO_PDF },
  fileFilter: portfolioPdfFilter,
}).single('report');
