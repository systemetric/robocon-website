<template>
  <div
    class="theme-container"
    :class="pageClasses"
    @touchstart="onTouchStart"
    @touchend="onTouchEnd"
  >
     <Navbar v-if="shouldShowNavbar" @toggle-sidebar="toggleSidebar" />
        <div class="sidebar-mask" @click="toggleSidebar(false)"></div>
    <Sidebar :items="sidebarItems" @toggle-sidebar="toggleSidebar">
      <slot name="sidebar-top" slot="top" />
      <slot name="sidebar-bottom" slot="bottom" />
    </Sidebar>
    <div class="custom-layout" v-if="$page.frontmatter.layout">
      <component :is="$page.frontmatter.layout" />
    </div>
    <Home v-else-if="$page.frontmatter.home" />
    <Page v-else :sidebar-items="sidebarItems">
      <slot name="page-top" slot="top" />
      <slot name="page-bottom" slot="bottom" />
    </Page>
        <div class="cookie-notice" id="cookie" v-if="showCookieNotice">
          Nom nom! Want some cookies? By continuing to use this site you're letting
          us give you some. You're also accepting our
          <router-link to="/privacy.html">Data Protection Policy</router-link>.
          <a href="#" @click.prevent="acceptCookies">(dismiss)</a>
        </div>
     </div>
</template>

<script>
import Vue from "vue";
import nprogress from "nprogress";
import Home from "./Home.vue";
import Navbar from "./Navbar.vue";
import Page from "./Page.vue";
import Sidebar from "./Sidebar.vue";
import { resolveSidebarItems } from "./util";
export default {
  components: { Home, Page, Sidebar, Navbar },
  data() {
    return {
      isSidebarOpen: false,
      showCookieNotice: false
    };
  },

  computed: {
    shouldShowNavbar() {
      const { themeConfig } = this.$site;
      const { frontmatter } = this.$page;
      if (frontmatter.navbar === false || themeConfig.navbar === false) {
        return false;
      }
      return (
        this.$title ||
        themeConfig.logo ||
        themeConfig.repo ||
        themeConfig.nav ||
        this.$themeLocaleConfig.nav
      );
    },
    shouldShowSidebar() {
      const { frontmatter } = this.$page;
      return (
        (!frontmatter.layout &&
          !frontmatter.home &&
          frontmatter.sidebar !== false &&
          this.sidebarItems.length) ||
        frontmatter.sidebar === true
      );
    },
    sidebarItems() {
      return resolveSidebarItems(
        this.$page,
        this.$route,
        this.$site,
        this.$localePath
      );
    },
    pageClasses() {
      const userPageClass = this.$page.frontmatter.pageClass;
      return [
        {
          "no-navbar": !this.shouldShowNavbar,
          "sidebar-open": this.isSidebarOpen,
          "no-sidebar": !this.shouldShowSidebar
        },
        userPageClass
      ];
    }
  },

  mounted() {
    this.showCookieNotice = !localStorage.getItem("accepted-cookies");

    window.addEventListener("scroll", this.onScroll);

       // configure progress bar
    nprogress.configure({ showSpinner: false });

    this.$router.beforeEach((to, fromRoute, next) => {
      if (
        to.path !== fromRoute.path &&
        !Vue.component(to.name) &&
        to.path !== "/forum/"
      ) {
        nprogress.start();
      }
      next();
    
        });

    this.$router.afterEach(to => {
      //i'm so sorry 
      const cookie = document.getElementById("cookie");
      if(window.location.pathname != "/"){cookie.className = "cookie-notice u"} else {
        cookie.className = "cookie-notice"
      }
            if (to.path !== "/forum/") {
        nprogress.done();
      }
      this.isSidebarOpen = false;
    });
  },

  methods: {
    toggleSidebar(to) {
      this.isSidebarOpen = typeof to === "boolean" ? to : !this.isSidebarOpen;
    },
    // side swipe
    onTouchStart(e) {
      this.touchStart = {
        x: e.changedTouches[0].clientX,
        y: e.changedTouches[0].clientY
      };
    },
    onTouchEnd(e) {
      const dx = e.changedTouches[0].clientX - this.touchStart.x;
      const dy = e.changedTouches[0].clientY - this.touchStart.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
        if (dx > 0 && this.touchStart.x <= 80) {
          this.toggleSidebar(true);
        } else {
          this.toggleSidebar(false);
        }
      }
    },
    acceptCookies() {
      this.showCookieNotice = false;
      localStorage.setItem("accepted-cookies", "yes");
    }
  }
};


</script>

<style src="prismjs/themes/prism-tomorrow.css"></style>
<style src="./styles/theme.styl" lang="stylus"></style>

<style lang="stylus">
.cookie-notice
  position: absolute
  top: 6.5rem
  left: 0
  right: 0
  z-index: 99
  background-color: #333333
  color: white
  padding: 10px 24px
  line-height: 1.2
  text-align: center

.u 
  top: 3.5rem !important
</style>
