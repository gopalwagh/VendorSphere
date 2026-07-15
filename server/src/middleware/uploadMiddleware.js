import multer from "multer";

const storage = multer.memoryStorage();
// multer for images upload 
const upload = multer(
  {
    storage,
  }
);

// multer for excel file validation
const excelFilter = (req, file, cb) => {
  // 1. Safe Extension Extraction (Bina kisi extra package ke extension nikalo)
  const ext = file.originalname ? file.originalname.split('.').pop().toLowerCase() : "";

  // 2. Production-Safe Mimetypes List
  const allowedMimeTypes = [
    // Standard .xlsx
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
    // Standard .xls
    "application/vnd.ms-excel",                         // Cloud/Linux servers binary safeguard                
    "application/octet-stream"                     
  ];

  // 3. Triple-Check Validation (Extension sahi ho YA mimetype allowed ho)
  if (ext === "xlsx" || ext === "xls" || allowedMimeTypes.includes(file.mimetype)) {
    // File validation clear!
    cb(null, true); 
  } else {
    cb(new Error("Only Excel files (.xlsx/.xls) are allowed!"), false);
  }
};

export default upload;

export const uploadExcel = multer({
  storage,
  fileFilter: excelFilter,
  //Safe limit: Max 10MB file allow karega production me
  limits : { fileSize: 10 * 1024 * 1024 } 
})