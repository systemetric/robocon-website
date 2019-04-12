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
  fs.readFileSync(path.resolve(__dirname, "..", "sizes.json"), {
    encoding: "utf8"
  })
);

module.exports = {
  title: "RoboCon",
  head: [
    ["script", { src: "/prism.js" }],
    [
      "script",
      {
        src:
          "https://polyfill.io/v3/polyfill.min.js?flags=gated&features=default%2CArray.from"
      }
    ]
  ],
  themeConfig: {
    nav: [
      { text: "About", link: "/about/" },
      { text: "Competition", link: "/competition/" },
      { text: "Gallery", link: "/gallery/" },
      { text: "Docs", link: "/docs/" },
      { text: "Blog", link: "/blog/" },
      { text: "Forum", link: "/forum/" }
    ],
    sidebar: {
      "/docs/": docsSidebar,
      "/about/": aboutSidebar,
      "/competition/": ["/competition/", "/competition/rounds.md"]
    },
    imageSizes: imageSizes
  },
  configureWebpack: (config, isServer) => {
    if (process.env.NODE_ENV !== "production") {
      return {
        plugins: [
          new BundleAnalyzerPlugin({
            openAnalyzer: false
          })
        ]
      };
    } else if (!isServer) {
      return {
        plugins: [
          new BundleAnalyzerPlugin({
            analyzerMode: "static",
            openAnalyzer: false
          })
        ]
      };
    }
    return {};
  }
};
