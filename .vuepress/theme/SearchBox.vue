<template>
  <div class="search-box">
    <input
      @input="query = $event.target.value"
      aria-label="Search"
      :value="query"
      autocomplete="off"
      spellcheck="false"
      @focus="focused = true"
      @blur="focused = true"
      @keyup.enter="go(focusIndex)"
      @keyup.up="onUp"
      @keyup.down="onDown"
    />
    <ul
      class="suggestions"
      v-if="showSuggestions"
      :class="{ 'align-right': alignRight }"
      @mouseleave="unfocus"
    >
      <template v-for="(s, i) in suggestions">
        <hr v-if="s.firstForumSuggestion" key="forum-separator" />
        <p v-if="s.firstForumSuggestion" key="forum-header" class="forum-header">Forum Threads</p>
        <li
          class="suggestion"
          :key="s.path"
          :class="{ focused: i === focusIndex }"
          @mousedown="go(i)"
          @mouseenter="focus(i)"
        >
          <a :href="s.path" @click.prevent>
            <span class="page-title">{{ s.title || s.path }}</span>
            <span v-if="s.header" class="header">&gt; {{ s.header.title }}</span>
          </a>
        </li>
      </template>
      <li v-if="searchingForum" class="forum-suggestion-loader">
        <hr v-if="suggestions && suggestions.length" />
        <div>
          <Loader />
          <p>Searching forum posts...</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import Loader from "../forum/components/Loader";
import { request } from "../forum/store/api";
import { clearTimeout, setTimeout } from "timers";

export default {
  components: {
    Loader
  },
  data() {
    return {
      query: "",
      focused: false,
      focusIndex: 0,
      forumSuggestions: [],
      searchingForum: false,
      forumSearchTimeoutId: -1
    };
  },
  computed: {
    showSuggestions() {
      return (
        this.focused &&
        ((this.suggestions && this.suggestions.length) || this.searchingForum)
      );
    },
    suggestions() {
      const query = this.query.trim().toLowerCase();
      if (!query) {
        return;
      }

      const { pages, themeConfig } = this.$site;
      const max = themeConfig.searchMaxSuggestions || 5;
      const localePath = this.$localePath;
      const matches = item =>
        item.title && item.title.toLowerCase().indexOf(query) > -1;
      const res = [];
      for (let i = 0; i < pages.length; i++) {
        if (res.length >= max) break;
        const p = pages[i];
        // filter out results that do not match current locale
        if (this.getPageLocalePath(p) !== localePath) {
          continue;
        }
        if (matches(p)) {
          res.push(p);
        } else if (p.headers) {
          for (let j = 0; j < p.headers.length; j++) {
            if (res.length >= max) break;
            const h = p.headers[j];
            if (matches(h)) {
              res.push(
                Object.assign({}, p, {
                  path: p.path + "#" + h.slug,
                  header: h
                })
              );
            }
          }
        }
      }

      return [...res, ...this.forumSuggestions];
    },
    // make suggestions align right when there are not enough items
    alignRight() {
      const navCount = (this.$site.themeConfig.nav || []).length;
      const repo = this.$site.repo ? 1 : 0;
      return navCount + repo <= 2;
    }
  },
  methods: {
    getPageLocalePath(page) {
      for (const localePath in this.$site.locales || {}) {
        if (localePath !== "/" && page.path.indexOf(localePath) === 0) {
          return localePath;
        }
      }
      return "/";
    },
    onUp() {
      if (this.showSuggestions) {
        if (this.focusIndex > 0) {
          this.focusIndex--;
        } else {
          this.focusIndex = this.suggestions.length - 1;
        }
      }
    },
    onDown() {
      if (this.showSuggestions) {
        if (this.focusIndex < this.suggestions.length - 1) {
          this.focusIndex++;
        } else {
          this.focusIndex = 0;
        }
      }
    },
    go(i) {
      if (!this.showSuggestions) {
        return;
      }
      this.$router.push(this.suggestions[i].path);
      this.query = "";
      this.focusIndex = 0;
    },
    focus(i) {
      this.focusIndex = i;
    },
    unfocus() {
      this.focusIndex = -1;
    }
  },
  watch: {
    query(query) {
      if (this.forumSearchTimeoutId !== -1) {
        clearTimeout(this.forumSearchTimeoutId);
        this.forumSearchTimeoutId = -1;
      }
      this.forumSuggestions = [];
      if (query === "") {
        this.searchingForum = false;
      } else {
        this.searchingForum = true;
        this.forumSearchTimeoutId = setTimeout(() => {
          console.log(query);
          request("GET", `/api/forum/thread/?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(res => {
              if (query === this.query) {
                console.log(res);
                this.forumSuggestions = res.map((thread, i) => ({
                  title: thread.title,
                  path: `/forum/#thread=${thread.id}`,
                  firstForumSuggestion: i == 0
                }));
                this.searchingForum = false;
              }
            });
        }, 500);
      }
    }
  }
};
</script>

<style lang="stylus">
@import './styles/config.styl';

.search-box {
  display: inline-block;
  position: relative;
  margin-right: 0.5rem;

  input {
    cursor: text;
    width: 10rem;
    color: lighten($textColor, 25%);
    display: inline-block;
    border: 1px solid darken($borderColor, 10%);
    border-radius: 2rem;
    font-size: 0.9rem;
    line-height: 2rem;
    height: 2rem;
    padding: 0 0.5rem 0 2rem;
    outline: none;
    transition: all 0.2s ease;
    background: #fff url('./search.svg') 0.6rem 0.5rem no-repeat;
    background-size: 1rem;

    &:focus {
      cursor: auto;
      border-color: $accentColor;
    }
  }

  .suggestions {
    background: #fff;
    width: 20rem;
    position: absolute;
    top: 1.5rem;
    border: 1px solid darken($borderColor, 10%);
    border-radius: 6px;
    padding: 0.4rem;
    list-style-type: none;

    &.align-right {
      right: 0;
    }
  }

  .suggestion {
    line-height: 1.4;
    padding: 0.4rem 0.6rem;
    border-radius: 4px;
    cursor: pointer;

    a {
      color: lighten($textColor, 35%);

      .page-title {
        font-weight: 600;
      }

      .header {
        font-size: 0.9em;
        margin-left: 0.25em;
      }
    }

    &.focused {
      background-color: #f3f4f5;

      a {
        color: $accentColor;
      }
    }
  }

  p.forum-header {
    margin: 0;
    padding: 0 0.6rem;
    color: lighten($textColor, 35%);
    font-size: 0.9em;
  }

  .forum-suggestion-loader {
    > div {
      padding: 0 0.6rem;
      display: flex;
      align-items: center;

      .forum-loader {
        margin-right: 0.5rem;
      }

      p {
        color: lighten($textColor, 35%);
        font-weight: 600;
      }
    }
  }
}

@media (max-width: $MQNarrow) {
  .search-box {
    input {
      cursor: pointer;
      width: 0;
      border-color: transparent;
      position: relative;
      left: 1rem;

      &:focus {
        cursor: text;
        left: 0;
        width: 10rem;
      }
    }
  }
}

@media (max-width: $MQNarrow) and (min-width: $MQMobile) {
  .search-box {
    .suggestions {
      left: 0;
    }
  }
}

@media (max-width: $MQMobile) {
  .search-box {
    margin-right: 0;

    .suggestions {
      right: 0;
    }
  }
}

@media (max-width: $MQMobileNarrow) {
  .search-box {
    .suggestions {
      width: calc(100vw - 4rem);
    }

    input:focus {
      width: 8rem;
    }
  }
}
</style>
