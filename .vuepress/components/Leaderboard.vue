<template>
  <div>
    <div v-if="loading" style="text-align: center">
      <OperationAnimation :always="true" />
    </div>
    <table v-else-if="enabled" class="leaderboard-table">
      <tbody>
        <tr v-for="team in teams" :key="team.id">
          <td>
            {{ team.position }}<sup>{{ team.positionEnding }}</sup>
          </td>
          <td>
            <div
              class="profile-image"
              :style="{
                backgroundImage: `url('https://avatars.io/twitter/${
                  team.twitter
                }')`
              }"
            ></div>
          </td>
          <td>{{ team.name }}</td>
          <td>{{ team.score }}</td>
        </tr>
      </tbody>
    </table>
    <IconText v-else icon="/images/outline-format_list_numbered-24px.svg">
      Once the competition has started, you'll be able to see teams' league
      ranks here.
    </IconText>
  </div>
</template>

<script>
import OperationAnimation from "../forum/components/OperationAnimation";

const positionEndings = [
  "th",
  "st",
  "nd",
  "rd",
  "th",
  "th",
  "th",
  "th",
  "th",
  "th"
];

export default {
  name: "leaderboard",
  components: { OperationAnimation },
  data() {
    return {
      enabled: null,
      meta: {}
    };
  },
  computed: {
    loading() {
      return (
        (this.enabled === null || !(".key" in this.meta)) &&
        this.enabled !== false
      );
    },
    teams() {
      const teams = [];

      // noinspection JSUnresolvedVariable
      const longnames = this.meta.longnames || {};
      const positions = this.meta.positions || {};
      // noinspection JSUnresolvedVariable
      const scores = this.meta.scores || {};
      const twitter = this.meta.twitter || {};

      let i = 0;
      while (longnames[i.toString()]) {
        const k = i.toString();
        const position = positions[k];
        teams.push({
          id: i,
          name: longnames[k],
          position: position,
          positionEnding:
            10 < position % 100 && position % 100 < 20
              ? positionEndings[0]
              : positionEndings[position % 10],
          score: scores[k],
          twitter: twitter[k]
        });
        i++;
      }

      teams.sort((a, b) => a.position - b.position);

      return teams;
    }
  },
  beforeMount() {
    import("../firebase").then(({ db }) => {
      // noinspection JSUnresolvedFunction
      const enabledRef = db.doc("meta/enabled");
      enabledRef.get().then(enabledDoc => {
        this.enabled =
          (enabledDoc.exists && enabledDoc.data().enabled) ||
          window.location.hash === "#force-enabled";
        if (this.enabled) {
          // noinspection JSUnresolvedFunction
          const metaRef = db.doc("meta/meta");
          this.$binding("meta", metaRef);
        }
      });
    });
  }
};
</script>

<style lang="stylus">
.leaderboard-table tr
  border none

  td, th
    border none

    &:nth-child(1), &:nth-child(3)
      text-align center

    &:nth-child(2)
      padding 0

    &:nth-child(3)
      text-align left
      width 100%

  .profile-image
    border-radius 50%
    width 24px
    height 24px
    background-size contain
    background-position center
</style>
