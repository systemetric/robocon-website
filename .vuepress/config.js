const fs = require("fs");
const path = require("path");
const fm = require("front-matter");
const docsCategories = require("./categories");
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;

function makeSidebar(dirPath, categories = []) {
  const sidebar = [
    {
      collapsable: false,
      children: [
        {
          name: "",
          position: -1
        }
      ]
    }
  ].concat(
    categories.map(category => ({
      title: category,
      collapsable: false,
      children: []
    }))
  );

  fs.readdirSync(dirPath)
    .filter(item => item.endsWith(".md") && item !== "README.md")
    .map(item => ({
      name: item.substring(0, item.length - 3),
      frontmatter: fm(
        fs.readFileSync(path.resolve(dirPath, item), { encoding: "utf-8" })
      ).attributes
    }))
    .forEach(item => {
      const category =
        item.frontmatter.category === "None"
          ? sidebar[0]
          : sidebar.find(group => group.title === item.frontmatter.category);
      if (category) {
        category.children.push({
          name: item.name,
          position: item.frontmatter.position
        });
      }
    });
  sidebar.forEach(group => {
    group.children.sort((a, b) => a.position - b.position);
    group.children = group.children.map(item => item.name);
  });

  return sidebar;
}

const docsSidebar = makeSidebar(
  path.resolve(__dirname, "..", "docs"),
  docsCategories
);
const aboutSidebar = makeSidebar(path.resolve(__dirname, "..", "about"), []);

const imageSizes = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "..", ".build", "sizes.json"), {
    encoding: "utf8"
  })
);

const galleryZipSizes = {};
const zipsPath = path.resolve(__dirname, "public", "galleryzips");
for (const zip of fs.readdirSync(zipsPath)) {
  const zipPath = path.join(zipsPath, zip);

  let size = fs.statSync(zipPath).size;
  const data = fs.readFileSync(zipPath, { encoding: "utf8" });
  if (data.startsWith("version https://git-lfs.github.com/spec/v1")) {
    const lines = data.split("\n");
    size = parseInt(lines[2].split(" ")[1]);
  }

  galleryZipSizes[zip.substring(0, zip.length - 4)] = size;
}

function makeGallerySidebar() {
  const galleries = fm(
    fs.readFileSync(path.resolve(__dirname, "..", "gallery", "README.md"), {
      encoding: "utf-8"
    })
  ).attributes.galleries;

  return galleries.map(gallery => ({
    customTitle: gallery.name,
    link: `/gallery/#${gallery.name.toLowerCase().replace(/ /g, "-")}`
  }));
}

module.exports = {
  title: "RoboCon",
  head: [
    // ["script", { src: "/prism.js" }],
    // [
    //   "script",
    //   {
    //     src:
    //       "https://polyfill.io/v3/polyfill.min.js?flags=gated&features=default%2CArray.from"
    //   }
    // ],
    [
      "script",
      {},
      "var global = global || window;var Buffer = Buffer || [];" /*
    var process = process || {
      env: { DEBUG: undefined },
      version: []
    }; */
    ]
  ],
  themeConfig: {
    nav: [
      { text: "About", link: "/about/" },
      { text: "Gallery", link: "/gallery/" },
      { text: "Docs", link: "/docs/" },
      { text: "Blog", link: "/blog/" },
      { text: "New Forum", link: "/forum/" }
    ],
    sidebar: {
      "/docs/": docsSidebar,
      "/about/": aboutSidebar,
      "/competition/": ["/competition/", "/competition/rounds.md"],
      "/gallery/": makeGallerySidebar()
    },
    imageSizes: imageSizes,
    galleryZipSizes: galleryZipSizes
  },
  configureWebpack: (config, isServer) => {
    const dev = process.env.NODE_ENV !== "production";

    if (!isServer) {
      // Quill requires its SVG icons to be loaded inline, not via a file,
      // so it needs to be excluded from the normal SVG rule and a new rule
      // including it needs to be added
      config.module.rules
        .filter(rule => /svg/.test(rule.test.toString()))
        .forEach(rule => (rule.exclude = /quill/));
      // Make sure this rule is first in the list
      config.module.rules.unshift({
        test: /\.svg$/,
        include: [path.resolve("./node_modules/quill/assets")],
        loaders: [{ loader: "html-loader", options: { minimize: true } }]
      });

      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: dev ? "server" : "static",
          openAnalyzer: false
        })
      );

      // Add an entry point for admin.jsx and a loader to handle it
      config.entry["admin"] = ["./.vuepress/public/admin/admin.jsx"];
      config.module.rules.push({
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            plugins: [["@babel/plugin-transform-react-jsx", { pragma: "h" }]]
          }
        }
      });
    }
  }
};
