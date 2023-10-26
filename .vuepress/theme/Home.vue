<template>
  <div class="home-root">
    <Banner />
    <div v-if="data.heroImage" class="img" :style="{ backgroundImage: `url('${$withBase(data.heroImage)}')` }" alt="hero">
    </div>
    <div class="home">
      <h1 class="title-text">{{ data.titleText }}</h1>
      <div class="features" v-if="data.features && data.features.length">
        <div class="feature" v-for="feature in data.features">
          <h2>{{ feature.title }}</h2>
          <p>{{ feature.details }}</p>
        </div>
      </div>
      <Content custom />
      <div class="footer" v-if="data.footer">
        {{ data.footer }}
        <p>
          <router-link to="/about/">About </router-link>
          |
          <router-link to="about/contact.html"> Contact Us </router-link>
          |
          <router-link to="/privacy.html"> Data Protection Policy</router-link>
        </p>
        <a href="https://www.netlify.com">
          <img alt="Deploys by Netlify" src="https://www.netlify.com/img/global/badges/netlify-color-bg.svg" />
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import NavLink from "./NavLink.vue";
import Banner from "./Banner.vue";

export default {
  components: { Banner, NavLink },
  computed: {
    data() {
      return this.$page.frontmatter;
    },
    actionLink() {
      return {
        link: this.data.actionLink,
        text: this.data.actionText
      };
    }
  }
};
</script>

<style lang="stylus">
@import './styles/config.styl';

$heroHeight = 8rem;

.home-root .img {
  margin-top: 3.5rem
  width: 100%;
  height: calc(100vh - 3.6rem - 8rem);
  background-position: center;
  background-size: cover;
}

.home {
  padding: 0 2rem;
  padding-top: 0 !important;
  max-width: 960px;
  margin: 0px auto;

  .title-text {
    text-align: center;
  }

  .features {
    border-top: 1px solid $borderColor;
    padding: 1.2rem 0;
    margin-top: 0 !important;
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    align-content: stretch;
    justify-content: space-between;
  }

  .feature {
    flex-grow: 1;
    flex-basis: 30%;
    max-width: 30%;
    text-align: center;
    margin: 0 auto;

    h2 {
      font-size: 1.4rem;
      font-weight: 500;
      border-bottom: none;
      padding-bottom: 0;
      color: lighten($textColor, 10%);
    }

    p {
      color: lighten($textColor, 25%);
    }

    .feature-button {
      display: inline-block;
      width: 100%;
      font-size: 1.2rem;
      color: #fff;
      background-color: $accentColor;
      padding: 0.8rem 1.6rem;
      border-radius: 4px;
      transition: background-color 0.1s ease;
      box-sizing: border-box;
      border-bottom: 1px solid darken($accentColor, 10%);

      &:hover {
        background-color: lighten($accentColor, 10%);
      }
    }
  }

  .content.custom {
    text-align: center;
  }

  .footer {
    padding: 2.5rem;
    border-top: 1px solid $borderColor;
    text-align: center;
    color: lighten($textColor, 25%);
  }
}

@media (max-width: $MQNarrow) {
  .home-root .img {
    height: 56.25vw;
  }

  .home {
    .hero {
      margin-top: ($navbarHeight / 2);
      flex-direction: column;
      height: auto;
    }

    .features {
      margin-top: 2.5rem !important;
    }
  }
}

@media (max-width: $MQMobile) {
  .home {
    .features {
      flex-direction: column;
    }

    .feature {
      max-width: 100%;
      padding: 0 2.5rem;
    }
  }
}

@media (max-width: $MQMobileNarrow) {
  .home {
    padding-left: 1.5rem;
    padding-right: 1.5rem;

    .hero {
      img {
        max-height: 210px;
        margin: 2rem auto 1.2rem;
      }

      h1 {
        font-size: 2rem;
      }

      h1, .description, .action {
        margin: 1.2rem auto;
      }

      .description {
        font-size: 1.2rem;
      }

      .action-button {
        font-size: 1rem;
        padding: 0.6rem 1.2rem;
      }
    }

    .feature {
      h2 {
        font-size: 1.25rem;
      }

      h1 {
        font-size: 1.75rem;
      }
    }
  }
}
</style>
