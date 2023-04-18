// noinspection JSUnresolvedFunction
require("dotenv").config();
const { promisify } = require("util");
const fs = require("fs");
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const path = require("path");
const sizeOf = promisify(require("image-size"));
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
      encoding: "utf8"
    });
    sizes = JSON.parse(cachedSizesJson);
  } else {
    console.warn(`warn: sizes cache did not exist at ${cachedSizesPath}`);
  }

  const addSize = (image, sizeObject) => {
    const { width, height } = sizeObject;

    sizes[`/images/${image}`] = {
      width,
      height
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
          size
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
        ).toString("base64")}`
      },
      body: {
        operation: "download",
        objects: objectsToRequest,
        ref: {
          name: "refs/heads/master"
        }
      },
      json: true
    };
    console.log(
      `info: requesting lfs info for ${objectsToRequest.length} images...`
    );
    const lfsRes = await request(lfsReq);
    /*const lfsRes = JSON.parse(
      '{"transfer":"basic","objects":[{"oid":"1685e73e503c83945ab722213b22c09f3811a724bd6308c79c0180035f8bf74e","size":69163,"authenticated":true,"actions":{"download":{"href":"https://nf-git-lfs-jfk-production.s3.amazonaws.com/e9902a70-1150-4450-b04d-0b67a720cfb2/1685e73e503c83945ab722213b22c09f3811a724bd6308c79c0180035f8bf74e?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAI45QHABMIC4EDVSA%2F20190415%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190415T094953Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=b704a80019c690a3dcfc1e9212ae20288a5ad77d5d939e0d3719f96c4c9d509d","expires_in":900}}},{"oid":"a6c03904e52b2628ac342f58676e1c88c733aa1596bc36a9f6ec0808d2ed5edf","size":760209,"authenticated":true,"actions":{"download":{"href":"https://nf-git-lfs-jfk-production.s3.amazonaws.com/e9902a70-1150-4450-b04d-0b67a720cfb2/a6c03904e52b2628ac342f58676e1c88c733aa1596bc36a9f6ec0808d2ed5edf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAI45QHABMIC4EDVSA%2F20190415%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190415T094953Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=9971634476e33a9dd94f424af98a987da29d6fe2f705491e9f0ebdf24ca46e93","expires_in":900}}},{"oid":"02cf30dc79bcb50fcf3e874f7f3e5ed903a3c250bcf76d6061e3e020b8311c93","size":48773,"authenticated":true,"actions":{"download":{"href":"https://nf-git-lfs-jfk-production.s3.amazonaws.com/e9902a70-1150-4450-b04d-0b67a720cfb2/02cf30dc79bcb50fcf3e874f7f3e5ed903a3c250bcf76d6061e3e020b8311c93?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAI45QHABMIC4EDVSA%2F20190415%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20190415T094953Z&X-Amz-Expires=900&X-Amz-SignedHeaders=host&X-Amz-Signature=24311b37a7edea79e22ddc50af93fdbd59a3da11135cb45aa69e874c494992f3","expires_in":900}}}]}\n'
    );*/

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
      const sizePromise = new Promise(function(resolve, reject) {
        http.get(options, function (response) {
          const chunks = []
          response.on('data', function (chunk) {
            chunks.push(chunk)
          }).on('end', async function() {
            const buffer = Buffer.concat(chunks)
            const imageSize = await sizeOf(buffer)
            resolve(imageSize);
          })
        })
      })
      const imageSize = await sizePromise;
      addSize(image, imageSize);
      // noinspection JSUnresolvedVariable
      console.log(
        `info: [${Math.floor(
          ((i + 1) / objectsLength) * 100
        )}%] got size of ${image} (in ${imageSize.downloaded} bytes)`
      );
    }
  } else {
    console.log("info: no lfs files to request");
  }

  const sizesJson = JSON.stringify(sizes);
  await writeFile(sizesPath, sizesJson, {
    encoding: "utf8"
  });
  console.log(`info: wrote sizes to ${sizesPath}`);
  if (cachedSizesPath !== sizesPath) {
    await writeFile(cachedSizesPath, sizesJson, {
      encoding: "utf8"
    });
    console.log(`info: wrote sizes cache to ${cachedSizesPath}`);
  } else {
    console.log("info: skipped writing cache as same file");
  }
})();
