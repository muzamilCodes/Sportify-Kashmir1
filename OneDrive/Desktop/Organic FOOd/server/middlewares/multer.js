const multer = require("multer");

const upload = multer({
  dest: 'uploads/' ,
  limits: {
    fieldSize: 1024 * 1024 * 10, // 10mb fileSize
  },
});

const multmid = upload.single("image");


// console.log(multmid)


module.exports = multmid


