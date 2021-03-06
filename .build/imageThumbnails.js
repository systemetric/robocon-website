const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const sharp = require("sharp");
const mkdirp = require("mkdirp").sync;

function promisesAllSerial(promises) {
  return promises.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
}

(async () => {
  const imagesPath = path.resolve(
    __dirname,
    "..",
    ".vuepress",
    "public",
    "images"
  );
  const thumbnailOutputPath = path.resolve(
    __dirname,
    "..",
    ".vuepress",
    "public",
    "thumbnails",
    "images"
  );
  mkdirp(thumbnailOutputPath);

  const images = fs.readdirSync(imagesPath);
  const imageCount = images.length;

  console.log(`Processing ${imageCount} images...`);

  await promisesAllSerial(
    images.map(
      image =>
        new Promise(async resolve => {
          const imagePath = path.join(imagesPath, image);
          const { width, height } = sizeOf(imagePath);
          const aspectRatio = width / height;
          let madeThumbnail = false;

          if (
            image.endsWith("png") ||
            image.endsWith("jpg") ||
            image.endsWith("jpeg")
          ) {
            const thumbnailPath = path.join(thumbnailOutputPath, image);
            if (!fs.existsSync(thumbnailPath)) {
              const thumbnailWidth = 410;
              const thumbnailHeight = Math.floor(thumbnailWidth / aspectRatio);

              madeThumbnail = true;
              await sharp(imagePath)
                .resize(thumbnailWidth, thumbnailHeight)
                .toFile(thumbnailPath);
            }
          }

          console.log(`\t${image}${madeThumbnail ? " {MADE THUMBNAIL}" : ""}`);

          resolve();
        })
    )
  );

  console.log("Done processing!");
})();
