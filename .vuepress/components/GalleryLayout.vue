<template>
  <div class="page gallery">
    <div class="content custom" ref="grid">
      <ClientOnly>
        <template v-for="(gallery, galleryI) in galleries">
          <h1 :id="gallery.id" :key="`${galleryI}-header`">
            <a :href="`#${gallery.id}`" aria-hidden="true" class="header-anchor"
              >#</a
            >
            {{ gallery.name }}
          </h1>
          <button
            v-if="gallery.zipSize"
            @click="downloadZip(gallery.id)"
            :key="`${galleryI}-button`"
          >
            Download all as ZIP ({{ gallery.zipSize }})
          </button>

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
    >
      <transition name="image-loader-fade">
        <div v-if="isFullImageLoading" class="image-loader"></div>
      </transition>
    </div>
  </div>
</template>

<script>
import filesize from "filesize";

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
  computed: {
    isFullImageLoading() {
      return (
        this.selectedImage &&
        (this.selectedImage.startsWith("/thumbnails/") ||
          this.selectedImage.endsWith("?nf_resize=fit&w=410"))
      );
    }
  },
  created() {
    const sizes = this.$site.themeConfig.imageSizes;
    const zipSizes = this.$site.themeConfig.galleryZipSizes;
    const fm = this.$page.frontmatter || {};

    if (fm.galleries) {
      this.galleries = fm.galleries.map(gallery => {
        const id = gallery.name.toLowerCase().replace(/ /g, "-");
        return {
          name: gallery.name,
          id: id,
          zipSize: zipSizes[id]
            ? filesize(zipSizes[id], { spacer: "" })
            : false,
          images: (gallery.images || [])
            .filter(image => {
              const size = sizes[image];
              if (!size || !size.width || !size.height) {
                console.warn(`Missing size for ${image}!`);
                return false;
              }
              return true;
            })
            .map(image => {
              const { width, height } = sizes[image];
              return {
                image: image,
                // The large media transformation service is unavailable during development
                // and loading all images at full size kills gallery performance
                thumbnail:
                  process.env.NODE_ENV === "development"
                    ? `/thumbnails${image}`
                    : `${image}?nf_resize=fit&w=410`,
                el: null,
                loadStarted: false,
                loaded: false,
                width: width,
                height: height,
                aspectRatio: width / height
              };
            })
        };
      });
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
      const minY = window.pageYOffset - window.innerHeight;
      const maxY = window.pageYOffset + window.innerHeight * 2;

      this.galleries.forEach(gallery => {
        gallery.images.forEach(image => {
          if (image.loadStarted) return;

          const y =
            image.el.getBoundingClientRect().top +
            document.documentElement.scrollTop;

          if (minY < y && y < maxY) {
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
      // img.onload = () =>
      //   setTimeout(() => (this.selectedImage = image.image), 1000);

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
    },
    downloadZip(id) {
      window.location = `/galleryzips/${id}.zip`;
    }
  }
};
</script>

<style lang="sass">
$cross-size: 20px
$cross-height: 3px
$navbarHeight: 3.6rem
$border-colour: #CFD4DB
$text-colour: #2C3E50
$accentColor: #0094FF
$imageLoaderSize: 50px
$imageLoaderBorderSize: 6px

.gallery
  .content
    max-width: 1000px
    margin: 0 auto
    padding: 0 20px 20px 20px

    h1
      margin-top: (0.5rem - $navbarHeight)
      padding-top: ($navbarHeight + 1rem)
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

  .image-loader
    position: absolute
    z-index: 60
    top: 50%
    left: 50%
    width: $imageLoaderSize
    height: $imageLoaderSize
    margin-top: -($imageLoaderSize + 2 * $imageLoaderBorderSize) / 2
    margin-left: -($imageLoaderSize + 2 * $imageLoaderBorderSize) / 2
    border: $imageLoaderBorderSize solid transparent
    border-radius: 50%
    border-top-color: rgba(255, 255, 255, 0.6)
    animation: image-loader-spin 0.75s linear 0s infinite

  .image-loader-fade-enter-active, .image-loader-fade-leave-active
    transition: opacity 0.1s ease-in-out
  .image-loader-fade-enter, .image-loader-fade-leave-to
    opacity: 0

  button
    box-sizing: border-box
    width: 100%
    border: 1px solid $border-colour
    background-color: white
    color: $text-colour
    display: block
    border-radius: 1rem
    outline: none
    transition: all 0.3s ease
    font-size: 0.9rem
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif
    padding: 0.25rem 1rem
    height: 34px
    margin-top: 14px
    &:active, &:focus
      border-color: $accentColor
    &:not(:disabled)
      cursor: pointer
      &:hover
        opacity: 0.7
    &:disabled
      opacity: 0.5
      cursor: not-allowed

@keyframes image-loader-spin
  from
    transform: rotate(0deg)
  to
    transform: rotate(360deg)
</style>
