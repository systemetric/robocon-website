<template>
  <div class="page gallery">
    <div class="content custom" ref="grid">
      <ClientOnly>
        <template v-for="(gallery, galleryI) in galleries">
          <h1 :key="`${galleryI}-header`">{{ gallery.name }}</h1>
          <masonry
            :key="`${galleryI}-grid`"
            :cols="{ default: 3, 768: 2, 480: 1 }"
            :gutter="20"
          >
            <!--suppress JSUnresolvedVariable -->
            <div
              v-for="(image, imageI) in gallery.images"
              :key="imageI"
              class="image"
              :data-gallery-index="galleryI"
              :data-index="imageI"
              :class="{ loaded: image.loaded }"
              :style="{
                paddingTop: `${100 / image.aspectRatio}%`,
                backgroundImage: image.loaded
                  ? `url('${image.thumbnail}')`
                  : 'none'
              }"
              @click="showImage($event, image)"
            ></div>
          </masonry>
        </template>
      </ClientOnly>
    </div>
    <div
      class="lightbox"
      v-show="lightboxShown"
      :style="{ opacity: lightboxOpacity }"
      @click.stop="hideImage"
    >
      <div class="close-button" @click.stop="hideImage"></div>
    </div>
    <div
      class="animated-image"
      v-show="lightboxShown"
      :style="{
        opacity: imageOpacity,
        top: `${selectedImageRect.top}px`,
        left: `${selectedImageRect.left}px`,
        width: selectedImageRect.width,
        height: selectedImageRect.height,
        backgroundImage: selectedImage ? `url('${selectedImage}')` : 'none'
      }"
      @click.stop="hideImage"
    ></div>
  </div>
</template>

<script>
export default {
  name: "gallery-layout",
  data() {
    return {
      lightboxShown: false,
      lightboxOpacity: 0,
      imageOpacity: 0,
      selectedImage: "",
      selectedImageRect: {
        top: 0,
        left: 0,
        width: "0",
        height: "0"
      },
      galleries: [],
      boundOnScroll: null
    };
  },
  created() {
    const sizes = this.$site.themeConfig.imageSizes;
    const fm = this.$page.frontmatter || {};

    if (fm.galleries) {
      this.galleries = fm.galleries.map(gallery => ({
        name: gallery.name,
        images: (gallery.images || []).map(image => ({
          image: image,
          thumbnail: `${image}?nf_resize=fit&w=410`,
          el: null,
          loadStarted: false,
          loaded: false,
          ...sizes[image]
        }))
      }));
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.onScroll);
  },
  mounted() {
    //noinspection JSUnresolvedVariable
    const grid = this.$refs.grid;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const imageElements = grid.querySelectorAll(".image");
        const childCount = imageElements.length;
        for (let i = 0; i < childCount; i++) {
          const imageElement = imageElements[i];
          const galleryI = parseInt(imageElement.dataset.galleryIndex);
          const imageI = parseInt(imageElement.dataset.index);
          this.galleries[galleryI].images[imageI].el = imageElement;
        }
        this.onScroll();
        window.addEventListener("scroll", this.onScroll);
      });
    });
  },
  methods: {
    onScroll() {
      const maxY = window.pageYOffset + window.innerHeight * 2;
      this.galleries.forEach(gallery => {
        gallery.images.forEach(image => {
          if (image.loadStarted) return;
          const y =
            image.el.getBoundingClientRect().top +
            document.documentElement.scrollTop;
          if (y < maxY) {
            image.loadStarted = true;
            const img = new Image();
            img.onload = () => (image.loaded = true);
            img.src = image.thumbnail;
          }
        });
      });
    },
    showImage(e, image) {
      if (!image.loaded) return;
      this.selectedImage = image.thumbnail;

      const rect = e.target.getBoundingClientRect();
      this.selectedImageRect.top = rect.top;
      this.selectedImageRect.left = rect.left;
      this.selectedImageRect.width = rect.width + "px";
      this.selectedImageRect.height = rect.height + "px";
      this.lightboxOpacity = 0;
      this.imageOpacity = 1;
      this.lightboxShown = true;

      const img = new Image();
      img.onload = () => (this.selectedImage = image.image);

      // Double requestAnimationFrame ensures initial animation state renders
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.lightboxOpacity = 1;
          this.selectedImageRect.top = 40;
          this.selectedImageRect.left = 40;
          this.selectedImageRect.width = `calc(100vw - 80px)`;
          this.selectedImageRect.height = `calc(100vh - 80px)`;
          img.src = image.image;
        });
      });
    },
    hideImage() {
      this.imageOpacity = 0;
      this.lightboxOpacity = 0;
      setTimeout(() => {
        this.lightboxShown = false;
        this.selectedImageRect.top = 0;
        this.selectedImageRect.left = 0;
        this.selectedImageRect.width = "0";
        this.selectedImageRect.height = "0";
      }, 500);
    }
  }
};
</script>

<style lang="sass">
$cross-size: 20px
$cross-height: 3px

.gallery
  .content
    max-width: 1000px
    margin: 0 auto
    padding: 0 20px 20px 20px

    h1
      margin-bottom: 0

  .image
    margin-top: 20px
    background-position: center
    background-size: cover
    background-repeat: no-repeat
    transform-origin: center
    opacity: 0
    transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out, opacity 0.15s ease-in-out
    transform: scale(1)

    &.loaded
      opacity: 1
      cursor: pointer

      &:hover
        transform: scale(1.02)
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23)

  .lightbox
    position: fixed
    top: 0
    left: 0
    bottom: 0
    right: 0
    z-index: 30
    background-color: rgba(0, 0, 0, 0.5)
    padding: 40px
    transition: all 0.5s ease-in-out

    .close-button
      position: absolute
      top: $cross-size
      right: $cross-size
      width: $cross-size
      height: $cross-size

      &::before, &::after
        position: absolute
        top: ($cross-size / 2) - ($cross-height / 2)
        left: 0
        content: ""
        width: 100%
        height: $cross-height
        background-color: white

      &::before
        transform: rotate(45deg)

      &::after
        transform: rotate(-45deg)

  .animated-image
    position: fixed
    z-index: 40
    background-position: center
    background-size: contain
    background-repeat: no-repeat
    transition: all 0.5s ease-in-out
</style>
