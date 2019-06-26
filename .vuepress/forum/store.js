import Vuex from "vuex";

export const MUTATION_SET_USER = "SET_USER";
export const MUTATION_SET_THREADS = "SET_THREADS";

export const ACTION_GET_THREADS = "GET_THREADS";

const store = new Vuex.Store({
  state: {
    threads: null,
    user: null,
    userLoaded: false
  },
  getters: {
    isModerator({ user }) {
      return user && user["https://hr-robocon.org/is_moderator"];
    }
  },
  mutations: {
    [MUTATION_SET_USER](state, user) {
      state.user = user;
      state.userLoaded = true;
    },
    [MUTATION_SET_THREADS](state, threads) {
      state.threads = threads;
    }
  },
  actions: {
    [ACTION_GET_THREADS]({ commit }) {
      return fetch("http://localhost:8085/api/forum/thread/")
        .then(res => res.json())
        .then(res =>
          res.map(thread => {
            thread.created = new Date(thread.created);
            return thread;
          })
        )
        .then(res => commit(MUTATION_SET_THREADS, res));
    }
  }
});

export default store;
