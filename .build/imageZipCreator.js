const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const archiver = require("archiver");
const mkdirp = require("mkdirp").sync;
const request = require("request-promise-native");

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
  return new Promise(async (resolve, reject) => {
    const { name, images } = gallery;
    const id = name.toLowerCase().replace(/ /g, "-");

    const cache = (...args) => {
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
      resolve(...args);
    };

    const zip = archiver("zip", { zlib: { level: 9 } });
    zip.on("close", cache);
    zip.on("finish", cache);
    zip.on("error", reject);
    zip.pipe(fs.createWriteStream(path.join(galleryZipsDir, id + ".zip")));

    for (const image of images) {
      console.log(image);

      const imagePath = path.resolve(
        __dirname,
        "..",
        ".vuepress",
        "public",
        image.substring(1)
      );
      const lfsData = await fs.readFile(imagePath, { encoding: "utf8" }).split("\n");
      if (lfsData[0] === "version https://git-lfs.github.com/spec/v1") {
        const oid = lfsData[1].split(" ")[1].split(":")[1];
        const size = parseInt(lfsData[2].split(" ")[1]);

        const lfsConfig = await fs.readFile(
          path.resolve(__dirname, "..", ".lfsconfig"),
          { encoding: "utf8" }
        );
        const largeMediaUrl = /https:\/\/.*\/\.netlify\/large-media/.exec(
          lfsConfig
        )[0];

        const lfsReq = {
          uri: `${largeMediaUrl}/objects/batch`,
          method: "POST",
          headers: {
            "User-Agent":
              "git-lfs/2.7.1 (GitHub; windows amd64; go 1.11.5; git 6b7fb6e3)",
            Accept: "application/vnd.git-lfs+json; charset=utf-8",
            Authorization: `Basic ${Buffer.from(
              `access-token:${process.env.LFS_ACCESS_TOKEN}`
            ).toString("base64")}`,
          },
          body: {
            operation: "download",
            objects: [{ oid, size }],
            ref: {
              name: "refs/heads/master",
            },
          },
          json: true,
        };
        console.log(`info: requesting lfs info for ${imagePath}`);
        const lfsRes = await request(lfsReq);
        const object = lfsRes.objects[0];
        const download = object.actions.download.href;
        const image = await request.get({ uri: download, encoding: null });

        fs.createWriteStream(imagePath).write(image);
      }

      zip.file(imagePath, {
        name: path.basename(image),
      });
    }

    zip.finalize();
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
