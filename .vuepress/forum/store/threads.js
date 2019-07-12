import { ACTION_REQUEST } from "./api";

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

function sortThreads(threads) {
  threads.sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.created.getTime() - a.created.getTime();
  });
}

export default {
  namespaced: true,
  state: {
    threads: null,
    messages: {}
  },
  mutations: {
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
    [ACTION_GET_THREADS]({ state, dispatch, commit }) {
      if (state.threads === null) {
        return dispatch(
          ACTION_REQUEST,
          {
            route: "/api/forum/thread/"
          },
          { root: true }
        )
          .then(parseCreatedDates)
          .then(res => commit(_MUTATION_SET_THREADS, res));
      }
    },
    [ACTION_GET_MESSAGES]({ state, dispatch, commit }, threadId) {
      if (!state.messages[threadId]) {
        return dispatch(
          ACTION_REQUEST,
          {
            route: `/api/forum/thread/${encodeURIComponent(threadId)}/message/`
          },
          { root: true }
        )
          .then(parseCreatedDates)
          .then(res =>
            commit(_MUTATION_SET_MESSAGES, { threadId, messages: res })
          );
      }
    },
    async [ACTION_CREATE_THREAD]({ dispatch, commit }, createThreadRequest) {
      return dispatch(
        ACTION_REQUEST,
        {
          method: "POST",
          route: "/api/forum/thread/",
          body: createThreadRequest
        },
        { root: true }
      )
        .then(res => {
          res.created = new Date(res.created);
          res.messages[0].created = new Date(res.messages[0].created);
          return res;
        })
        .then(res => commit(_MUTATION_ADD_THREAD_WITH_MESSAGES, res));
    }
  }
};
