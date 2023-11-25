// noinspection JSUnresolvedFunction
require("dotenv").config();
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const path = require("path");
const sizeOf = promisify(require("image-size"));
const syncSizeOf = require("image-size");
const request = require("request-promise-native");
const requestSizeOf = require("request-image-size");

function walkDir(root) {
  const names = [];
  for (const name of fs.readdirSync(root)) {
    const filePath = path.join(root, name);
    if (fs.statSync(filePath).isDirectory()) {
      names.push(
        ...walkDir(filePath).map((childName) => path.join(name, childName))
      );
    } else {
      names.push(name);
    }
  }
  return names;
}

(async () => {
  const imagesPath = path.resolve(
    __dirname,
    "..",
    ".vuepress",
    "public",
    "images"
  );

  const images = walkDir(imagesPath);
  const imagesLength = images.length;

  let sizes = {};
  const sizesPath = path.resolve(__dirname, "sizes.json");
  const cachedSizesPath = process.env.NETLIFY_BUILD_BASE
    ? path.resolve(process.env.NETLIFY_BUILD_BASE, "cache", "image-sizes.json")
    : sizesPath;
  if (fs.existsSync(cachedSizesPath)) {
    console.log(`info: loading sizes cache from ${cachedSizesPath}...`);
    const cachedSizesJson = await readFile(cachedSizesPath, {
      encoding: "utf8",
    });
    sizes = JSON.parse(cachedSizesJson);
  } else {
    console.warn(`warn: sizes cache did not exist at ${cachedSizesPath}`);
  }

  const addSize = (image, sizeObject) => {
    const { width, height } = sizeObject;

    sizes[`/images/${image}`] = {
      width,
      height,
    };
  };

  const oidMap = {};
  const objectsToRequest = [];

  let skipCount = 0;
  let normalFileCount = 0;
  let lfsFileCount = 0;

  for (let i = 0; i < imagesLength; i++) {
    const image = images[i];
    const imagePath = path.join(imagesPath, image);

    if (sizes[`/images/${image}`]) {
      skipCount++;
      continue;
    }

    try {
      const imageSize = await sizeOf(imagePath);
      addSize(image, imageSize);
      normalFileCount++;
    } catch (e) {
      const lfsData = (await readFile(imagePath, { encoding: "utf8" })).split(
        "\n"
      );
      if (lfsData[0] === "version https://git-lfs.github.com/spec/v1") {
        const oid = lfsData[1].split(" ")[1].split(":")[1];
        const size = parseInt(lfsData[2].split(" ")[1]);

        oidMap[oid] = image;

        objectsToRequest.push({
          oid,
          size,
        });
        lfsFileCount++;
      } else {
        console.error(`error: unknown file format for ${imagePath}`);
      }
    }
  }
  console.log(
    `info: found ${normalFileCount} normal file(s) and ${lfsFileCount} lfs file(s) [skipped ${skipCount} cached file(s)]`
  );

  if (objectsToRequest.length > 0) {
    const lfsConfig = await readFile(
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
          objects: objectsToRequest.slice(0,999),
        ref: {
          name: "refs/heads/master",
        },
      },
      json: true,
    };
    console.log(
      `info: requesting lfs info for ${objectsToRequest.length} images...`
    );
    
     var lfsRes;
    try {
      lfsRes = await request(lfsReq);}
    catch {console.log("errored")};
    console.log(lfsRes);
    for(let i = 0; i< objectsToRequest.length() / 7; i++ ){
      
    }
    console.log(lfsRes);
    const objectsLength = lfsRes.objects.length;
    for (let i = 0; i < objectsLength; i++) {
      const object = lfsRes.objects[i];

      const oid = object.oid;
      const image = oidMap[oid];
      const download = object.actions.download.href;

      console.log(
        `info: [${Math.floor(
          (i / objectsLength) * 100
        )}%] requesting image size of ${image}...`
      );

      const result = await request.get({ uri: download, encoding: null });
      const imageSize = syncSizeOf(result);
      addSize(image, imageSize);
      // noinspection JSUnresolvedVariable
      console.log(
        `info: [${Math.floor(
          ((i + 1) / objectsLength) * 100
        )}%] got size of ${image}`
      );
    }
  } else {
    console.log("info: no lfs files to request");
  }

  const sizesJson = JSON.stringify(sizes);
  await writeFile(sizesPath, sizesJson, {
    encoding: "utf8",
  });
  console.log(`info: wrote sizes to ${sizesPath}`);
  if (cachedSizesPath !== sizesPath) {
    await writeFile(cachedSizesPath, sizesJson, {
      encoding: "utf8",
    });
    console.log(`info: wrote sizes cache to ${cachedSizesPath}`);
  } else {
    console.log("info: skipped writing cache as same file");
  }
})();
