<template>
  <div class="requires-registration">
    <slot v-if="isRegistered" />
    <template v-else-if="user">
      <p>
        In order to {{action}}, you'll need a registration code. This code is the same as the password printed on your teams brainbox, which can also be found on the lid of your teams box, please email
        <a
          href="mailto:robotics@hrsfc.ac.uk"
          target="_blank"
          rel="noopener noreferrer"
        >robotics@hrsfc.ac.uk</a> if you have any issues.
      </p>
      <div class="code-input">
        <input type="text" placeholder="Code" v-model="code" @keypress="onKeyPress" />
        <a class="button primary" :class="{disabled}" @click="register">Register</a>
      </div>
    </template>
  </div>
</template>

<script>
import nprogress from "nprogress";
import { mapState, mapGetters, mapActions } from "vuex";
import { MODULE_USER, ACTION_REGISTER_USER } from "../store";

export default {
  name: "requires-registration",
  props: {
    action: {
      type: String,
      default: "post on the forum"
    }
  },
  data() {
    return {
      code: "",
      registering: false
    };
  },
  computed: {
    ...mapState(MODULE_USER, ["user"]),
    ...mapGetters(MODULE_USER, ["isRegistered"]),
    disabled() {
      return this.code === "" || this.registering;
    }
  },
  methods: {
    ...mapActions(MODULE_USER, [ACTION_REGISTER_USER]),
    onKeyPress(e) {
      if (e.keyCode === 13 /* enter */) {
        this.register();
      }
    },
    register() {
      if (!this.disabled) {
        this.registering = true;
        nprogress.start();
        this[ACTION_REGISTER_USER](this.code).then(() => {
          nprogress.done();
          this.registering = false;
        });
      }
    }
  }
};
</script>

<style lang="sass">
.requires-registration
  > p
    margin: 0 0 0.5rem 0
  > .code-input
    display: flex
    input[type="text"]
      width: 100px
      margin: 0 0.25rem 0 0
      flex-grow: 1
    @media(max-width: 419px)
      flex-direction: column
      input[type="text"]
        margin: 0 0 0.25rem 0
        width: calc(100% - 1.6rem - 2px)
        flex-grow: 1
</style>
