const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const mkdirp = require("mkdirp").sync;
const Gauge = require("gauge");

var gauge = new Gauge();

function promisesAllSerial(promises) {
  return promises.reduce((promiseChain, currentTask) => {
    return promiseChain.then(chainResults =>
      currentTask.then(currentResult => [...chainResults, currentResult])
    );
  }, Promise.resolve([]));
}

(async () => {
  const imagesPath = path.resolve(__dirname, "public", "images");
  const compressedImagesPath = path.resolve(__dirname, "public", "compressed");
  mkdirp(compressedImagesPath);

  const images = fs.readdirSync(imagesPath);
  const imagesLength = images.length;

  // noinspection JSCheckFunctionSignatures
  await promisesAllSerial(
    images
      .filter(image => image.endsWith(".jpg") || image.endsWith(".jpeg"))
      .map(
        (image, i) =>
          new Promise(async resolve => {
            const imagePath = path.join(imagesPath, image);
            const compressedImagePath = path.join(compressedImagesPath, image);

            // > 1.5MB
            if (fs.statSync(imagePath).size > 1500000) {
              await sharp(imagePath)
                .jpeg({
                  quality: 60
                })
                .toFile(compressedImagePath);
            }

            // noinspection JSUnresolvedFunction
            gauge.show(image, i / imagesLength);

            resolve();
          })
      )
  );

  // noinspection JSUnresolvedFunction
  gauge.show("Done!", 1);
})();
