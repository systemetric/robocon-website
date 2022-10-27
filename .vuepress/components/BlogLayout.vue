<template>
  <div class="page blog">
    <div class="content">
      <div v-for="post in posts" :key="post.post.key" class="post">
        <!--suppress HtmlUnknownTag -->
        <router-link :to="post.post.path" class="post-content">
          <img
            class="post-image"
            v-if="post.post.frontmatter.image"
            :src="post.post.frontmatter.image"
          />
          <h1>{{ post.post.frontmatter.title }}</h1>
          <p class="light">Published on {{ post.date.toDateString() }}</p>
          <p>{{ post.post.frontmatter.excerpt }}</p>
        </router-link>
        <!--suppress HtmlUnknownTag -->
        <router-link :to="post.post.path">Read More →</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "blog-layout",
  computed: {
    posts() {
      return this.$site.pages
        .filter(page => page.path.startsWith("/blog/") && page.path.length > 6)
        .map(page => ({
          post: page,
          date: new Date(page.frontmatter.date)
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());
    }
  }
};
</script>

<style lang="stylus">
@import '../theme/styles/config.styl';

.page.blog .post {
  margin-top: 0;

  &:not(:first-child) {
    padding-top: 2rem;
  }

  &:not(:last-child) {
    padding-bottom: 2rem;
    border-bottom: 1px solid #EAECEF;
  }

  a.post-content {
    font-weight: unset;
    color: $textColor;
    text-decoration: none;

    h1 {
      margin: 0 0 0.3rem 0;
    }

    p.light {
      color: #AAA;
      font-style: italic;
      margin: 0;
    }

    .post-image {
      margin-bottom: 1rem;
    }
  }
}
</style>
