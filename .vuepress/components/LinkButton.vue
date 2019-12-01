<template>
  <a :href="to" class="link-button" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>
</template>

<script>
export default {
  name: "link-button",
  props: {
    to: {
      type: String,
      default: "#"
    }
  }
};
</script>
