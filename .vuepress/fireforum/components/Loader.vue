<template>
  <div class="loader">
    <PacmanLoader color="#AAA" size="50px" />
    <p>{{ phrase }}</p>
  </div>
</template>

<script>
import { PacmanLoader } from "vue-loaders";

//const phrases = ["Loading posts...", "", "Phrase 3"];

export default {
  name: "loader",
  components: {
    PacmanLoader
  },
  data() {
    return {
      intervalId: -1
    };
  },
  props: {
    phrase: {
      type: String,
      default: "Loading posts..."
    }
  }
  /*mounted() {
    clearInterval(this.intervalId);
    this.intervalId = -1;
    this.newPhrase();
    this.intervalId = setInterval(() => {
      this.newPhrase();
    }, 1000);
  },
  beforeDestroy() {
    this.intervalId = -1;
    clearInterval(this.intervalId);
  },
  methods: {
    newPhrase() {
      let newPhrase = this.phrase;
      while (newPhrase === this.phrase) {
        newPhrase = phrases[Math.floor(Math.random() * phrases.length)];
      }
      this.phrase = newPhrase;
    }
  }*/
};
</script>

<style></style>
