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
  if(
    file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
    file.mimetype === "application/vnd.ms-excel" // .xls
  ) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xlsx/.xls) are allowed!"), false);
  }
};

export default upload;

export const uploadExcel = multer({
  storage,
  fileFilter: excelFilter,
})