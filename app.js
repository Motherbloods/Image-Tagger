const express = require("express");
const multer = require("multer");
const Jimp = require("jimp");
const path = require("path");
const fs = require("fs");
const archiver = require("archiver");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // 1 MB
}).array("images", 100);

app.set("view engine", "ejs");
// Serve static files from the 'public' directory
app.use(express.static("public"));

function resolveFileNameConflict(filePath) {
  let index = 1;
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const ext = path.extname(filePath);
  let newFilePath = filePath;

  // Loop until finding a non-conflicting file name
  while (fs.existsSync(newFilePath)) {
    const baseName = fileName.replace(ext, "");
    const newFileName = `${baseName}(${index})${ext}`;
    newFilePath = path.join(dirName, newFileName);
    index++;
  }

  return newFilePath;
}

app.get("/", (req, res) => {
  fs.readdir("uploads", (err, files) => {
    if (err) {
      console.error("Error reading upload directory:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.render("index", { files });
    }
  });
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      console.error("Error uploading file:", err);
      res.status(500).send("Internal Server Error");
    } else {
      const files = req.files;
      if (files.length > 2) {
        const zipFilePath = path.join(__dirname, "uploads", "images.zip");
        const resolvedFilePath = resolveFileNameConflict(zipFilePath);
        const output = fs.createWriteStream(resolvedFilePath);
        const archive = archiver("zip", { zlib: { level: 9 } });
        output.on("close", () => {
          files.forEach((file) => {
            console.log(file);
            fs.unlinkSync(file.path);
            if (file.editedPath) {
              fs.unlinkSync(file.editedPath);
            }
          });
          // res.download(resolvedFilePath);
          res.redirect("/");
        });
        archive.pipe(output);
        let filesProcessed = 0;

        // Process editing uploaded images
        files.forEach((file) => {
          const filePath = file.path;
          const editedFilePath = filePath.replace(/\.[^.]+$/, ".edited.jpg");
          const originalFileName = file.originalname;
          const modifiedFileName = originalFileName
            .replace(/Screenshot /, "")
            .replace(
              /(\d{4})-(\d{2})-(\d{2}) (\d{2})(\d{2})(\d{2}).*$/,
              (match, year, month, day, hours, minutes, seconds) => {
                // Parsing tanggal dan waktu menjadi objek Date
                const dateObj = new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  seconds
                );
                // Mendapatkan komponen tanggal dan waktu
                const formattedDay = dateObj.getDate();
                const formattedMonth = dateObj.toLocaleString("default", {
                  month: "long",
                });
                const formattedYear = dateObj.getFullYear();
                const formattedHours = dateObj.getHours();
                const formattedMinutes = dateObj.getMinutes();

                // Menggabungkan elemen-elemen ke dalam format yang diinginkan
                return `${formattedDay} ${formattedMonth} ${formattedYear} ${formattedHours}:${formattedMinutes}`;
              }
            );

          Jimp.read(filePath)
            .then((image) => {
              // Load font
              Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
                .then((font) => {
                  // Print text on the image
                  image.print(
                    font,
                    -50,
                    0,
                    {
                      text: modifiedFileName,
                      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
                      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
                    },
                    image.bitmap.width,
                    image.bitmap.height
                  );

                  // Write the edited image to file
                  image
                    .writeAsync(editedFilePath)
                    .then(() => {
                      file.editedPath = editedFilePath;
                      archive.append(fs.createReadStream(editedFilePath), {
                        name: file.originalname,
                      });
                      filesProcessed++;
                      if (filesProcessed === files.length) {
                        archive.finalize();
                      }
                    })
                    .catch((err) => {
                      console.error("Error writing edited file:", err);
                      res.status(500).send("Internal Server Error");
                    });
                })
                .catch((err) => {
                  console.error("Error loading font:", err);
                  res.status(500).send("Internal Server Error");
                });
            })
            .catch((err) => {
              console.error("Error editing file:", err);
              res.status(500).send("Internal Server Error");
            });
        });
      } else {
        // If less than or equal to 2 files, continue with the existing logic
        files.forEach((file) => {
          const filePath = file.path;
          const editedFilePath = filePath.replace(/\.[^.]+$/, ".edited.jpg");
          const originalFileName = file.originalname;
          const modifiedFileName = originalFileName
            .replace(/Screenshot /, "")
            .replace(
              /(\d{4})-(\d{2})-(\d{2}) (\d{2})(\d{2})(\d{2}).*$/,
              (match, year, month, day, hours, minutes, seconds) => {
                // Parsing tanggal dan waktu menjadi objek Date
                const dateObj = new Date(
                  year,
                  month - 1,
                  day,
                  hours,
                  minutes,
                  seconds
                );
                // Mendapatkan komponen tanggal dan waktu
                const formattedDay = dateObj.getDate();
                const formattedMonth = dateObj.toLocaleString("default", {
                  month: "long",
                });
                const formattedYear = dateObj.getFullYear();
                const formattedHours = dateObj.getHours();
                const formattedMinutes = dateObj.getMinutes();

                // Menggabungkan elemen-elemen ke dalam format yang diinginkan
                return `${formattedDay} ${formattedMonth} ${formattedYear} ${formattedHours}:${formattedMinutes}`;
              }
            );

          Jimp.read(filePath)
            .then((image) => {
              // Load font
              Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
                .then((font) => {
                  // Print text on the image
                  image.print(
                    font,
                    -50,
                    0,
                    {
                      text: modifiedFileName,
                      alignmentX: Jimp.HORIZONTAL_ALIGN_RIGHT,
                      alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
                    },
                    image.bitmap.width,
                    image.bitmap.height
                  );

                  // Write the edited image to file
                  image
                    .writeAsync(editedFilePath)
                    .then(() => {
                      fs.unlinkSync(filePath);
                      file.editedPath = editedFilePath;
                      // If this is the last file, redirect to index
                      if (files.indexOf(file) === files.length - 1) {
                        res.redirect("/");
                      }
                    })
                    .catch((err) => {
                      console.error("Error writing edited file:", err);
                      res.status(500).send("Internal Server Error");
                    });
                })
                .catch((err) => {
                  console.error("Error loading font:", err);
                  res.status(500).send("Internal Server Error");
                });
            })
            .catch((err) => {
              console.error("Error editing file:", err);
              res.status(500).send("Internal Server Error");
            });
        });
      }
    }
  });
});

app.get("/download/:filename", (req, res) => {
  const file = path.join(__dirname, "uploads", req.params.filename);
  res.download(file);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
