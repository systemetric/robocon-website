const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const archiver = require("archiver");
const mkdirp = require("mkdirp").sync;

const galleries = fm(
  fs.readFileSync(path.resolve(__dirname, "..", "gallery", "README.md"), {
    encoding: "utf-8",
  })
).attributes.galleries;

const galleryZipsDir = path.resolve(
  __dirname,
  "..",
  ".vuepress",
  "public",
  "galleryzips"
);

const cachedGalleryZipsDir = process.env.NETLIFY_BUILD_BASE
  ? path.resolve(process.env.NETLIFY_BUILD_BASE, "cache", "galleryzips")
  : galleryZipsDir;

mkdirp(galleryZipsDir);
mkdirp(cachedGalleryZipsDir);

function archive(gallery) {
  return new Promise((resolve, reject) => {
    const { name, images } = gallery;
    const id = name.toLowerCase().replace(/ /g, "-");

    const zip = archiver("zip", { zlib: { level: 9 } });
    zip.on("close", resolve);
    zip.on("finish", resolve);
    zip.on("error", reject);
    zip.pipe(fs.createWriteStream(path.join(galleryZipsDir, id + ".zip")));

    for (const image of images) {
      console.log(image);
      zip.file(
        path.resolve(
          __dirname,
          "..",
          ".vuepress",
          "public",
          image.substring(1)
        ),
        {
          name: image.substring("/images/".length),
        }
      );
    }

    zip.finalize();

    // copy file to cache
    if (galleryZipsDir !== cachedGalleryZipsDir) {
      console.log("copying gallery zip to cache");
      fs.copyFileSync(
        path.join(galleryZipsDir, id + ".zip"),
        path.join(cachedGalleryZipsDir, id + ".zip")
      );
    } else {
      console.log(
        "The cache directory is the same as the gallery directory, skipping cache copy"
      );
    }
  });
}

(async () => {
  for (const gallery of galleries) {
    console.log(gallery.name);
    if (
      fs.existsSync(
        path.join(
          galleryZipsDir,
          gallery.name.toLowerCase().replace(/ /g, "-") + ".zip"
        )
      )
    ) {
      console.log(`${gallery.name} is already archived, skipping`);
      continue;
    } else if (
      fs.existsSync(
        path.join(
          cachedGalleryZipsDir,
          gallery.name.toLowerCase().replace(/ /g, "-") + ".zip"
        )
      )
    ) {
      console.log(
        `${gallery.name} is already cached, copying cache to main location`
      );
      fs.copyFileSync(
        path.join(
          cachedGalleryZipsDir,
          gallery.name.toLowerCase().replace(/ /g, "-") + ".zip"
        ),
        path.join(
          galleryZipsDir,
          gallery.name.toLowerCase().replace(/ /g, "-") + ".zip"
        )
      );
      continue;
    } else {
      await archive(gallery);
    }

    console.log("✔");
  }
})();
