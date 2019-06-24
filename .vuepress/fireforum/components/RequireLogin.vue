<template>
  <div class="form">
    <!--suppress HtmlUnknownTag -->
    <transition name="fade">
      <div
        v-if="message.message"
        class="custom-block"
        :class="{ [message.type]: true }"
      >
        <p class="custom-block-title">{{ message.title }}</p>
        <p>{{ message.message }}</p>
      </div>
    </transition>
    <div v-if="isNotLoggedIn" class="login">
      <p>Sign in to ask a question or post a response...</p>
      <IconButton @click="signIn('google')">
        <template slot="icon"
          ><img src="../assets/google.svg"
        /></template>
        Sign in with Google
      </IconButton>
      <IconButton @click="signIn('github')">
        <template slot="icon"
          ><img src="../assets/github.svg"
        /></template>
        Sign in with GitHub
      </IconButton>
    </div>
    <div v-else-if="isNotRegistered" class="login">
      <p>
        Before you can post on the forums, please enter a valid registration
        code...
      </p>
      <input
        type="text"
        name="code"
        placeholder="Registration Code"
        v-model="registerCode"
      />
      <label class="checkbox-label">
        <input type="checkbox" v-model="boxChecked" /><span
          >By checking this box, I agree that my data will be handled in
          accordance with the
          <a href="/privacy.html" target="_blank"
            >Data Protection Policy</a
          ></span
        >
      </label>
      <button
        @click="register"
        :disabled="registering || registerCode === '' || !boxChecked"
      >
        Register
      </button>
    </div>
    <slot v-else />
  </div>
</template>

<script>
export default {
  name: "require-login",
  props: {
    user: {
      type: Object
    },
    userCodes: {
      required: true
    }
  },
  data() {
    return {
      message: {
        timeoutHandle: -1,
        type: "",
        title: "",
        message: ""
      },
      registerCode: "",
      registering: false,
      boxChecked: false
    };
  },
  computed: {
    isNotLoggedIn() {
      return !this.user;
    },
    isNotRegistered() {
      if (!this.user) {
        return true;
      }

      const uid = this.user.uid;
      return !(uid in this.userCodes);
    }
  },
  watch: {
    isNotRegistered(newValue) {
      if (!newValue) this.boxChecked = false;
    }
  },
  methods: {
    showMessage(type, title, message) {
      if (this.message.timeoutHandle !== -1)
        clearTimeout(this.message.timeoutHandle);

      this.message.type = type;
      this.message.title = title;
      this.message.message = message;

      this.message.timeoutHandle = setTimeout(() => {
        this.message.type = "";
        this.message.title = "";
        this.message.message = "";
      }, 3000);
    },
    signIn(provider) {
      import("../../firebase/auth").then(({ signIn }) => signIn(provider));
    },
    register() {
      this.registering = true;
      const code = this.registerCode;
      this.$emit("doing", true);
      import("../../firebase").then(({ verifyRegistrationCode }) => {
        // noinspection JSUnresolvedFunction
        verifyRegistrationCode(code).then(res => {
          this.$emit("doing", false);

          this.registering = false;

          const { valid, message } = res;

          this.showMessage(
            valid ? "tip" : "warning",
            valid ? "Success" : "Error",
            message
          );
        });
      });
    }
  }
};
</script>

<style lang="sass">
.form
  max-width: 500px
  margin: 0 auto
  display: flex
  flex-direction: column
  align-items: center
  text-align: center
  > textarea:not(:last-child),
  > p:not(:last-child),
  > button:not(:last-child),
  > input:not(:last-child)
    margin-bottom: 0.6rem
  .custom-block
    width: 100%
    max-width: 300px
    box-sizing: border-box
    text-align: left
  .login
    display: flex
    flex-direction: column
    align-items: center
    text-align: center
    max-width: 300px
    > *:not(:last-child)
      margin: 0 0 0.6rem 0 !important
    .button-group
      width: 100%
      display: flex
      flex-direction: row
      > button
        flex-grow: 1
        &:not(:last-child)
          margin-right: 0.25rem
        &:not(:first-child)
          margin-left: 0.25rem
    .checkbox-label
      display: flex
      flex-direction: row
      align-items: center
      text-align: left
      input
        margin-right: 1em
        width: 4em
</style>
