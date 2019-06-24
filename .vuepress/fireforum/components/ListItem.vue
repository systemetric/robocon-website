<template>
    <div class="list-item">
        <div class="left">
            <!--suppress JSUnresolvedVariable -->
            <div v-if="image" class="image" :style="{backgroundImage: `url(${image})`}"></div>
        </div>
        <div class="details">
            <slot></slot>
        </div>
        <div v-if="hasRight" class="right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script>
export default {
  name: "list-item",
  props: {
    image: {
      type: String
    },
    hasRight: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="sass">
$profile-image-size: 60px
$mobile-profile-image-size: 40px

.list-item
    padding: 0.5rem
    display: flex
    margin-bottom: 1rem
    .left
        min-width: $profile-image-size
        height: $profile-image-size
        margin-right: 1rem
        //noinspection CssOptimizeSimilarProperties
        .image
            width: 100%
            height: 100%
            background-size: cover
            background-repeat: no-repeat
            background-position: center
            border-radius: 50%
    .details
        flex-grow: 1
        h3
            margin: 0 0 0.4rem 0
        p
            margin: 0.4rem 0
            &.light
                color: #AAA
    .right
        min-width: $profile-image-size
        height: $profile-image-size
        margin-left: 1rem
@media(max-width: 768px)
  .list-item
    .left
      min-width: $mobile-profile-image-size
      height: $mobile-profile-image-size
    .right
      display: none
@media(max-width: 959px)
  .list-item .details
    max-width: calc(100vw - 72px - 4rem) !important
@media(max-width: 419px)
  .list-item .details
    max-width: calc(100vw - 72px - 3rem) !important
</style>
