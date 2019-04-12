<template>
  <transition name="fade">
    <div
      v-if="loading || always"
      class="operation-animation"
      :class="{ 'load-complete': done && !always }"
    >
      <div class="checkmark draw" v-show="done && !always"></div>
    </div>
  </transition>
</template>

<script>
export default {
  name: "operation-animation",
  data() {
    return {
      loading: false,
      done: false
    };
  },
  props: {
    doing: {
      type: Boolean,
      default: false
    },
    always: {
      type: Boolean,
      default: false,
    }
  },
  watch: {
    doing(newValue) {
      if (newValue) {
        this.loading = true;
      } else {
        this.done = true;
        setTimeout(() => {
          this.loading = false;
          this.done = false;
        }, 500);
      }
    }
  }
};
</script>

<style lang="scss">
// https://codepen.io/scottloway/pen/zqoLyQ
$brand-success: #0094ff;
$loader-size: 3.5rem;
$check-height: $loader-size/2 - 0.1rem;
$check-width: $check-height/2 - 0.1rem;
$check-left: ($loader-size/6 + $loader-size/24);
$check-thickness: 6px;
$check-color: $brand-success;

.operation-animation {
  border: $check-thickness solid rgba(0, 0, 0, 0.2);
  border-left-color: $check-color;
  animation: loader-spin 1.2s infinite linear;
  position: relative;
  display: inline-block;
  vertical-align: top;
  border-radius: 50%;
  width: $loader-size;
  height: $loader-size;
}

.load-complete {
  -webkit-animation: none;
  animation: none;
  border-color: $check-color;
  transition: border 500ms ease-out;
}

.checkmark {
  //display: none;

  &.draw:after {
    animation-duration: 800ms;
    animation-timing-function: ease;
    animation-name: checkmark;
    transform: scaleX(-1) rotate(135deg);
  }

  &:after {
    opacity: 1;
    height: $check-height;
    width: $check-width;
    transform-origin: left top;
    border-right: $check-thickness solid $check-color;
    border-top: $check-thickness solid $check-color;
    content: "";
    left: $check-left;
    top: $check-height + 0.1rem;
    position: absolute;
  }
}

@keyframes loader-spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: $check-width;
    opacity: 1;
  }
  40% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
  100% {
    height: $check-height;
    width: $check-width;
    opacity: 1;
  }
}
</style>
