<template>
  <div>
    <div v-if="loading" style="text-align: center">
      <OperationAnimation :always="true" />
    </div>
    <table v-else-if="enabled" class="rounds-table">
      <thead>
        <tr>
          <th>Round</th>
          <th>Corner 0</th>
          <th>Corner 1</th>
          <th>Corner 2</th>
          <th>Corner 3</th>
          <th>State</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="round in rounds" :key="round['.key']">
          <td>{{ round.name || `#${round[".key"]}` }}</td>
          <!--suppress JSUnresolvedVariable -->
          <td :title="meta.longnames[round.corners[0]]">
            {{ meta.names[round.corners[0]]
            }}{{ round.scores ? ` (+${round.scores[0]})` : "" }}
          </td>
          <!--suppress JSUnresolvedVariable -->
          <td :title="meta.longnames[round.corners[1]]">
            {{ meta.names[round.corners[1]]
            }}{{ round.scores ? ` (+${round.scores[1]})` : "" }}
          </td>
          <!--suppress JSUnresolvedVariable -->
          <td :title="meta.longnames[round.corners[2]]">
            {{ meta.names[round.corners[2]]
            }}{{ round.scores ? ` (+${round.scores[2]})` : "" }}
          </td>
          <!--suppress JSUnresolvedVariable -->
          <td :title="meta.longnames[round.corners[3]]">
            {{ meta.names[round.corners[3]]
            }}{{ round.scores ? ` (+${round.scores[3]})` : "" }}
          </td>
          <td>
            <!--suppress JSUnresolvedVariable -->
            <div v-if="round.completed" class="check" title="Completed"></div>
            <span v-else-if="round.time">{{ round.time | formatTime }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <IconText v-else icon="/images/outline-calendar_today-24px.svg">
      Once the competition has started, you'll be able to see upcoming rounds
      here.
    </IconText>
  </div>
</template>

<script>
import OperationAnimation from "../fireforum/components/OperationAnimation";

export default {
  name: "rounds-list",
  components: { OperationAnimation },
  data() {
    return {
      enabled: null,
      rounds: [],
      meta: {}
    };
  },
  filters: {
    formatTime(time) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      return `${hour}:${minute < 10 ? "0" + minute : minute}`;
    }
  },
  computed: {
    loading() {
      return (
        (this.enabled === null || this.rounds.length === 0) &&
        this.enabled !== false
      );
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
          // noinspection JSUnresolvedFunction
          const roundsRef = db.collection("rounds");
          this.$binding("rounds", roundsRef);
        }
      });
    });
  }
};
</script>

<style lang="stylus">
.rounds-table
  width 100%
  display table
  //table-layout fixed
  text-align center
  tr
    th, td
      &:nth-child(1)
        width 25%
      &:nth-child(n + 2)
        width 15%
      &:nth-child(2)
        color #FF9800
      &:nth-child(3)
        color #58A95C
      &:nth-child(4)
        color #E24A3F
      &:nth-child(5)
        color #2B94E7
  .check
    display inline-block
    width 20px
    height 20px
    background-image url("/images/outline-check-24px.svg")
    background-size contain
    background-position center
</style>
