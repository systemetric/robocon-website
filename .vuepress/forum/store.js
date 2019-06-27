import Vuex from "vuex";

export const MUTATION_SET_USER = "SET_USER";
export const MUTATION_SET_THREADS = "SET_THREADS";
export const MUTATION_SET_MESSAGES = "SET_MESSAGES";

export const ACTION_GET_THREADS = "GET_THREADS";
export const ACTION_GET_MESSAGES = "GET_MESSAGES";

function parseCreatedDates(arr) {
  return arr.map(obj => {
    obj.created = new Date(obj.created);
    return obj;
  });
}

const store = new Vuex.Store({
  state: {
    threads: null,
    messages: {},
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
    },
    [MUTATION_SET_MESSAGES](state, { threadId, messages }) {
      state.messages[threadId] = messages;
    }
  },
  actions: {
    [ACTION_GET_THREADS]({ state, commit }) {
      if (state.threads === null) {
        return fetch("http://localhost:8085/api/forum/thread/")
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res => commit(MUTATION_SET_THREADS, res));
      }
    },
    [ACTION_GET_MESSAGES]({ state, commit }, threadId) {
      if (!state.messages[threadId]) {
        return fetch(
          `http://localhost:8085/api/forum/thread/${encodeURIComponent(
            threadId
          )}/message/`
        )
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res =>
            commit(MUTATION_SET_MESSAGES, { threadId, messages: res })
          );
      }
    }
  }
});

export default store;
