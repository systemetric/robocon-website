<template>
  <!--Feather doesn't have a pin icon yet, but there's an open pull request for one here: https://github.com/feathericons/feather/pull/626 (which is copied below)-->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24px"
    height="24px"
    class="feather feather-pin"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    @click.prevent="$emit('click')"
  >
    <line x1="15.9" y1="15.9" x2="22" y2="22" />
    <path
      d="M13.1 7c.1-1.9-.6-3.7-1.9-5L2 11.2c1.3 1.3 3.1 2 5 1.9l2.4 2.4c-.1 1.9.6 3.7 1.9 5l9.2-9.2c-1.3-1.3-3.1-2-5-1.9L13.1 7z"
    />
  </svg>
</template>
