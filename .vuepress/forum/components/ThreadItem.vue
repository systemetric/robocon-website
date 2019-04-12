<template>
  <!--suppress JSUnresolvedVariable -->
  <ListItem :image="thread.author.photo" :has-right="true">
    <h3>{{thread.title}}</h3>
    <!--suppress JSUnresolvedVariable -->
    <p class="light">Created by {{thread.author.name}} on {{thread.lastModified.toDate().toLocaleString().replace(", ", " at ")}}</p>

    <template slot="right">
      <!--suppress JSUnresolvedVariable -->
      <div class="answer-count" :class="{resolved: thread.resolved}">
        <!--suppress JSUnresolvedVariable -->
        <span>{{thread.answers}}</span>
        <span>answer{{thread.answers === 1 ? '' : 's'}}</span>
      </div>
    </template>
  </ListItem>
</template>

<script>
import ListItem from "./ListItem";

export default {
  name: "thread-item",
  components: {
    ListItem
  },
  props: {
    thread: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="sass">
$accentColor: #0094FF

.answer-count
  width: 100%
  height: 100%
  border: 1px solid #AAA
  border-radius: 50%
  text-align: center
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
  span:first-child
    margin-top: -5px
    font-size: 1.5rem
    line-height: 1.55rem
  span:last-child
    font-size: 0.7rem
  &.resolved
    border-color: $accentColor
    color: $accentColor
</style>
