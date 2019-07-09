/* eslint-disable no-undef */

if (self.CMS) {
  CMS.registerPreviewStyle("/preview.css");
  CMS.registerPreviewStyle("/preview-extra.css");
}

const PreviewRoot = ({ children, home = false, pageClassName = "page" }) => {
  return (
    <div id="app">
      <div className="theme-container no-sidebar">
        {home ? (
          children
        ) : (
          <div className={pageClassName}>
            <div className="content custom" style={{ padding: "1rem" }}>
              {children}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GenericPreview = ({ widgetFor }) => {
  const body = widgetFor("body");

  return (
    <PreviewRoot pageClassName={"page post"} contentStyle={{ paddingTop: "0" }}>
      {body}
    </PreviewRoot>
  );
};

const HomePreview = ({ entry, getAsset, widgetFor }) => {
  const heroImage = entry.getIn(["data", "heroImage"]);
  const heroImagePath = getAsset(heroImage);

  const titleText = entry.getIn(["data", "titleText"]);
  const footer = entry.getIn(["data", "footer"]);

  const body = widgetFor("body");

  return (
    <PreviewRoot>
      <div className="home-root">
        <div
          className="img"
          style={{ backgroundImage: `url("${heroImagePath.toString()}")` }}
        />
        <div className="home">
          <h1 className="title-text">{titleText}</h1>
          <div className="content custom">{body}</div>
          <div className="footer">{footer}</div>
        </div>
      </div>
    </PreviewRoot>
  );
};

const GalleryPreview = ({ widgetsFor }) => {
  const galleries = widgetsFor("galleries");

  return (
    <PreviewRoot>
      {galleries.map((gallery, galleryIndex) => {
        const name = gallery.getIn(["data", "name"]);
        const images = gallery.getIn(["data", "images"]);

        return (
          <div key={galleryIndex}>
            <h1>{name}</h1>
            <div className="gallery-preview-grid">
              {images.map((image, imageIndex) => {
                const name = image.split("/").pop();
                return <span key={imageIndex}>{name}</span>;
              })}
            </div>
          </div>
        );
      })}
    </PreviewRoot>
  );
};

const PostPreview = ({ entry, widgetFor }) => {
  const title = entry.getIn(["data", "title"]);
  const date = entry.getIn(["data", "date"]);
  const body = widgetFor("body");

  return (
    <PreviewRoot pageClassName={"page post"}>
      <h1>{title}</h1>
      <p className="light">Published on {new Date(date).toDateString()}</p>
      <div className="content custom">{body}</div>
    </PreviewRoot>
  );
};

if (self.CMS) {
  CMS.registerPreviewTemplate("Home", HomePreview);
  CMS.registerPreviewTemplate("Gallery", GalleryPreview);
  CMS.registerPreviewTemplate("Data Protection Policy", GenericPreview);

  CMS.registerPreviewTemplate("about", GenericPreview);
  CMS.registerPreviewTemplate("doc", GenericPreview);
  CMS.registerPreviewTemplate("post", PostPreview);
}

// This component doesn't work that well as you can't include markdown in it
/*CMS.registerEditorComponent({
  id: "container",
  label: "Container",
  fields: [
    {
      name: "type",
      label: "Type",
      widget: "select",
      options: [
        { label: "Tip", value: "tip" },
        { label: "Warning", value: "warning" },
        { label: "Danger", value: "danger" }
      ]
    },
    {
      name: "content",
      label: "Content",
      widget: "markdown"
    }
  ],
  pattern: /:::(tip|warning|danger)\n(.*)\n:::/,
  fromBlock: match => ({
    type: match[1],
    content: match[2]
  }),
  toBlock: obj => `:::${obj.type}\n${obj.content}\n:::`,
  toPreview: ({ value }) => (
    <div className="tip custom-block">
      <p className="custom-block-title">TIP {value}</p>
      <p>
        You can also access these docs from your robot. Go to when you're
        connected to your robot.
      </p>
    </div>
  )
});*/

// This component doesn't seem to work, might have something to do with the pattern
// including <> which could indicate that it's not markdown and shouldn't be processed
/*
CMS.registerEditorComponent({
  id: "youtube",
  label: "YouTube",
  fields: [{ name: "id", label: "Video ID", widget: "string" }],
  pattern: /<YouTube id="(\S+)" \/>/,
  fromBlock: match => ({ id: match[1] }),
  toBlock: obj => `<YouTube id="${obj.id}" />`,
  toPreview: obj => () => (
    <div className="embed" style="padding-bottom: 56.25%;">
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${obj.id}`}
        frameBorder="0"
        allow="autoplay; encrypted-media"
        allowFullScreen="allowfullscreen"
      />
    </div>
  )
});
*/
