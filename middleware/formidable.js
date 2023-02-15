const formidable = require("formidable");

const upload = (req, res, next) => {
  const form = new formidable.IncomingForm();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .send("An error occurred while processing the file upload");
      return;
    }

    // Call the next middleware function or route handler
    next();
  });
};

module.exports = upload;
