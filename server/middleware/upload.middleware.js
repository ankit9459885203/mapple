// instead of express FileUploader , using multer
// here we are doing image validation ,  setting a size limit , unique file names


const multer = require("multer");
const path = require("path");


// This defines where and how the files will be saved on your server.
// destination specify the folder path
//filename: This is a crucial security step. Instead of using the user's original filename  it generates a unique name.It combines the current timestamp (Date.now()) with a large random number.
const storage = multer.diskStorage({

 destination: function (req, file, cb) {

  // if product API
  if (req.baseUrl.includes("product")) {
    cb(null, "public/product-images");
  }

  // if user API
  else if (req.baseUrl.includes("auth")) {
    cb(null, "public/user-images");
  }

  // otherwise chat API
  else {
    cb(null, "public/chat-images");
  }

},

  filename: function (req, file, cb) {

    const uniqueName =  Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});


// doing file validation ,
const fileFilter = (req, file, cb) => {

  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files allowed"), false);
  }
};


// this is the upload engine which is using above two functions (storage , filefilter)
//   hence everyting coming together in one single middleware object.


const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;   // exporting ,   and we will require it in routes  and controller