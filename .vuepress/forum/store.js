import Vuex from "vuex";

// const API_BASE_URL = "https://robocon.mrbbot.co.uk";
const API_BASE_URL = "http://localhost:8085";

export const MUTATION_SET_USER = "SET_USER";
const _MUTATION_SET_THREADS = "SET_THREADS";
const _MUTATION_SET_MESSAGES = "SET_MESSAGES";
const _MUTATION_ADD_THREAD_WITH_MESSAGES = "ADD_THREAD";

export const ACTION_GET_THREADS = "GET_THREADS";
export const ACTION_GET_MESSAGES = "GET_MESSAGES";
export const ACTION_CREATE_THREAD = "CREATE_THREAD";

function parseCreatedDates(arr) {
  return arr.map(obj => {
    obj.created = new Date(obj.created);
    return obj;
  });
}

function getAuthorizationHeaders() {
  return import("./auth")
    .then(auth => auth.service.getIdToken())
    .then(token => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }));
}

function sortThreads(threads) {
  threads.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.created.getTime() - a.created.getTime();
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
    [_MUTATION_SET_THREADS](state, threads) {
      state.threads = threads;
    },
    [_MUTATION_SET_MESSAGES](state, { threadId, messages }) {
      state.messages[threadId] = messages;
    },
    [_MUTATION_ADD_THREAD_WITH_MESSAGES](state, thread) {
      const threadMessages = thread.messages;
      state.messages[thread.id] = threadMessages;
      const threadCopy = { ...thread };
      delete threadCopy.messages;
      if (state.threads !== null) {
        const threads = [...state.threads, threadCopy];
        sortThreads(threads);
        state.threads = threads;
      }
    }
  },
  actions: {
    [ACTION_GET_THREADS]({ state, commit }) {
      if (state.threads === null) {
        return fetch(`${API_BASE_URL}/api/forum/thread/`)
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res => commit(_MUTATION_SET_THREADS, res));
      }
    },
    [ACTION_GET_MESSAGES]({ state, commit }, threadId) {
      if (!state.messages[threadId]) {
        return fetch(
          `${API_BASE_URL}/api/forum/thread/${encodeURIComponent(
            threadId
          )}/message/`
        )
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res =>
            commit(_MUTATION_SET_MESSAGES, { threadId, messages: res })
          );
      }
    },
    async [ACTION_CREATE_THREAD]({ commit }, createThreadRequest) {
      return fetch(`${API_BASE_URL}/api/forum/thread/`, {
        method: "POST",
        headers: await getAuthorizationHeaders(),
        body: JSON.stringify(createThreadRequest)
      })
        .then(res => res.json())
        .then(res => {
          res.created = new Date(res.created);
          res.messages[0].created = new Date(res.messages[0].created);
          return res;
        })
        .then(res => commit(_MUTATION_ADD_THREAD_WITH_MESSAGES, res));
    }
  }
});

export default store;
