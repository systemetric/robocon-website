<template>
  <div class="page post">
    <div class="content">
      <h1>{{post.post.title}}</h1>
      <p class="light">Published on {{post.date.toDateString()}}</p>
      <Content></Content>
    </div>
  </div>
</template>

<script>
export default {
  name: "post-layout",
  computed: {
    post() {
      return {
        post: this.$page,
        date: new Date(this.$page.frontmatter.date)
      };
    }
  }
};
</script>

<style lang="sass">
.page.post
  .content
    > h1:first-child
      margin: 0 0 0.3rem 0
      padding: 0
    p.light
      color: #AAA
      font-style: italic
      margin: 0
</style>
