<template>
  <Embed :aspect-ratio="16/9">
    <iframe width="560" height="315" :src="'https://www.youtube.com/embed/' + id" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
  </Embed>
</template>

<script>
export default {
  props: {
    id: {
      required: true
    }
  }
};
</script>
