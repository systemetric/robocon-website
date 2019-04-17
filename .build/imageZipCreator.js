const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const archiver = require("archiver");
const mkdirp = require("mkdirp").sync;

const galleries = fm(
  fs.readFileSync(path.resolve(__dirname, "..", "gallery", "README.md"), {
    encoding: "utf-8"
  })
).attributes.galleries;

const galleryZipsDir = path.resolve(
  __dirname,
  "..",
  ".vuepress",
  "public",
  "galleryzips"
);
mkdirp(galleryZipsDir);

function archive(gallery) {
  return new Promise((resolve, reject) => {
    const { name, images } = gallery;
    const id = name.toLowerCase().replace(/ /g, "-");

    const zip = archiver("zip", {});
    zip.on("close", resolve);
    zip.on("finish", resolve);
    zip.on("error", reject);
    zip.pipe(fs.createWriteStream(path.join(galleryZipsDir, id + ".zip")));

    for (const image of images) {
      zip.file(
        path.resolve(
          __dirname,
          "..",
          ".vuepress",
          "public",
          image.substring(1)
        ),
        {
          name: image.substring("/images/".length)
        }
      );
    }

    zip.finalize();
  });
}

(async () => {
  for (const gallery of galleries) {
    console.log(gallery.name);
    await archive(gallery);
    console.log("✔");
  }
})();
