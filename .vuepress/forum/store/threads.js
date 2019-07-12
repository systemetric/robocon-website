import { request } from "./api";
import {
  MODULE_NOTIFICATIONS,
  ACTION_SHOW_NOTIFICATION
} from "./notifications";

export const MODULE_THREADS = "threads/";

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
        return request("GET", "/api/forum/thread/")
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res => commit(_MUTATION_SET_THREADS, res))
          .catch(() =>
            dispatch(
              MODULE_NOTIFICATIONS + ACTION_SHOW_NOTIFICATION,
              { level: "error", content: "An unexpected error has occurred!" },
              { root: true }
            )
          );
      }
    },
    [ACTION_GET_MESSAGES]({ state, dispatch, commit }, threadId) {
      if (!state.messages[threadId]) {
        return request(
          "GET",
          `/api/forum/thread/${encodeURIComponent(threadId)}/message/`
        )
          .then(res => res.json())
          .then(parseCreatedDates)
          .then(res =>
            commit(_MUTATION_SET_MESSAGES, { threadId, messages: res })
          )
          .catch(() =>
            dispatch(
              MODULE_NOTIFICATIONS + ACTION_SHOW_NOTIFICATION,
              { level: "error", content: "An unexpected error has occurred!" },
              { root: true }
            )
          );
      }
    },
    async [ACTION_CREATE_THREAD]({ commit, dispatch }, createThreadRequest) {
      return request("POST", "/api/forum/thread/", createThreadRequest)
        .then(res => res.json())
        .then(res => {
          res.created = new Date(res.created);
          res.messages[0].created = new Date(res.messages[0].created);
          return res;
        })
        .then(res => {
          commit(_MUTATION_ADD_THREAD_WITH_MESSAGES, res);
          return dispatch(
            MODULE_NOTIFICATIONS + ACTION_SHOW_NOTIFICATION,
            { level: "success", content: "Message posted!" },
            { root: true }
          );
        })
        .catch(() =>
          dispatch(
            MODULE_NOTIFICATIONS + ACTION_SHOW_NOTIFICATION,
            { level: "error", content: "An unexpected error has occurred!" },
            { root: true }
          )
        );
    }
  }
};
