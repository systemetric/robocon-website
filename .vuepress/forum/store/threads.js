import { request } from "./api";
import { showSuccess, showUnexpectedErrorNotification } from "./notifications";

export const MODULE_THREADS = "threads";

const _MUTATION_SET_THREADS = "SET_THREADS";
const _MUTATION_SET_MESSAGES = "SET_MESSAGES";
const _MUTATION_ADD_THREAD_WITH_MESSAGES = "ADD_THREAD";
const _MUTATION_EDIT_TITLE = "EDIT_TITLE";
const _MUTATION_DELETE_THREAD = "DELETE_THREAD";
const _MUTATION_EDIT_MESSAGE = "EDIT_MESSAGE";
const _MUTATION_RESOLVE_MESSAGE = "RESOLVE_MESSAGE";
const _MUTATION_DELETE_MESSAGE = "DELETE_MESSAGE";
const _MUTATION_ADD_MESSAGE = "ADD_MESSAGE";
const _MUTATION_TOGGLE_PINNED_THREAD = "TOGGLE_PINNED_THREAD";

export const ACTION_GET_THREADS = "GET_THREADS";
export const ACTION_GET_MESSAGES = "GET_MESSAGES";
export const ACTION_CREATE_THREAD = "CREATE_THREAD";
export const ACTION_EDIT_TITLE = "EDIT_TITLE";
export const ACTION_DELETE_THREAD = "DELETE_THREAD";
export const ACTION_EDIT_MESSAGE = "EDIT_MESSAGE";
export const ACTION_RESOLVE_MESSAGE = "RESOLVE_MESSAGE";
export const ACTION_DELETE_MESSAGE = "DELETE_MESSAGE";
export const ACTION_CREATE_MESSAGE = "CREATE_MESSAGE";
export const ACTION_TOGGLE_PINNED_THREAD = "TOGGLE_PINNED_THREAD";

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

export function canEdit(object, $store) {
  const user = $store.state.user.user;
  const isOwner = user && object.author.id === user.id;
  const isModerator = $store.getters["user/isModerator"];
  return isOwner || isModerator;
}

const showMessagePostedNotification = showSuccess("Message posted!");
const showTitleSavedNotification = showSuccess("Title saved!");
const showThreadDeletedNotification = showSuccess("Thread deleted!");
const showMessageEditedNotification = showSuccess("Message edited!");
const showMessageDeletedNotification = showSuccess("Message deleted!");

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
      state.messages = {
        ...state.messages,
        [threadId]: messages
      };
    },
    [_MUTATION_ADD_THREAD_WITH_MESSAGES](state, thread) {
      state.messages[thread.id] = thread.messages;
      const threadCopy = { ...thread };
      delete threadCopy.messages;
      if (state.threads !== null) {
        const threads = [...state.threads, threadCopy];
        sortThreads(threads);
        state.threads = threads;
      }
    },
    [_MUTATION_EDIT_TITLE](state, { threadId, newTitle }) {
      state.threads = state.threads.map(thread => {
        if (thread.id === threadId) thread.title = newTitle;
        return thread;
      });
    },
    [_MUTATION_DELETE_THREAD](state, threadId) {
      state.threads = state.threads.filter(thread => thread.id !== threadId);
    },
    [_MUTATION_EDIT_MESSAGE](state, { threadId, messageId, newContent }) {
      if (threadId in state.messages) {
        state.messages[threadId] = state.messages[threadId].map(message => {
          if (message.id === messageId) message.content = newContent;
          return message;
        });
      }
    },
    [_MUTATION_RESOLVE_MESSAGE](state, { threadId, messageId, resolved }) {
      if (threadId in state.messages) {
        state.messages[threadId] = state.messages[threadId].map(message => {
          message.resolved = message.id === messageId ? resolved : false;
          return message;
        });
      }
    },
    [_MUTATION_DELETE_MESSAGE](state, { threadId, messageId }) {
      if (threadId in state.messages) {
        state.messages[threadId] = state.messages[threadId].filter(
          message => message.id !== messageId
        );
      }
    },
    [_MUTATION_ADD_MESSAGE](state, { threadId, message }) {
      if (threadId in state.messages) {
        state.messages[threadId] = [...state.messages[threadId], message];
      }
    },
    [_MUTATION_TOGGLE_PINNED_THREAD](state, threadId) {
      if (state.threads !== null) {
        const index = state.threads.findIndex(thread => thread.id === threadId);
        if (index !== -1) {
          state.threads[index].pinned = !state.threads[index].pinned;
          const threads = [...state.threads];
          sortThreads(threads);
          state.threads = threads;
        }
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
          .catch(showUnexpectedErrorNotification(dispatch));
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
          .catch(showUnexpectedErrorNotification(dispatch));
      }
    },
    [ACTION_CREATE_THREAD]({ commit, dispatch }, createThreadRequest) {
      return request("POST", "/api/forum/thread/", createThreadRequest)
        .then(res => res.json())
        .then(res => {
          res.created = new Date(res.created);
          res.messages[0].created = new Date(res.messages[0].created);
          return res;
        })
        .then(res => {
          commit(_MUTATION_ADD_THREAD_WITH_MESSAGES, res);
          return showMessagePostedNotification(dispatch)();
        })
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_EDIT_TITLE]({ commit, dispatch }, { thread, newTitle }) {
      commit(_MUTATION_EDIT_TITLE, { threadId: thread.id, newTitle });
      return request(
        "PATCH",
        `/api/forum/thread/${encodeURIComponent(thread.id)}`,
        {
          title: newTitle,
          pinned: thread.pinned
        }
      )
        .then(showTitleSavedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_DELETE_THREAD]({ commit, dispatch }, threadId) {
      commit(_MUTATION_DELETE_THREAD, threadId);
      return request(
        "DELETE",
        `/api/forum/thread/${encodeURIComponent(threadId)}`
      )
        .then(showThreadDeletedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_EDIT_MESSAGE](
      { commit, dispatch },
      { threadId, message, newContent }
    ) {
      commit(_MUTATION_EDIT_MESSAGE, {
        threadId,
        messageId: message.id,
        newContent
      });
      return request(
        "PATCH",
        `/api/forum/thread/${encodeURIComponent(
          threadId
        )}/message/${encodeURIComponent(message.id)}`,
        {
          content: newContent,
          resolved: message.resolved
        }
      )
        .then(showMessageEditedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_RESOLVE_MESSAGE](
      { commit, dispatch },
      { threadId, message, resolved }
    ) {
      commit(_MUTATION_RESOLVE_MESSAGE, {
        threadId,
        messageId: message.id,
        resolved
      });
      return request(
        "PATCH",
        `/api/forum/thread/${encodeURIComponent(
          threadId
        )}/message/${encodeURIComponent(message.id)}`,
        {
          content: message.content,
          resolved: resolved
        }
      )
        .then(
          showSuccess(`Thread marked as ${resolved ? "" : "un"}resolved!`)(
            dispatch
          )
        )
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_DELETE_MESSAGE]({ commit, dispatch }, { threadId, messageId }) {
      commit(_MUTATION_DELETE_MESSAGE, { threadId, messageId });
      return request(
        "DELETE",
        `/api/forum/thread/${encodeURIComponent(
          threadId
        )}/message/${encodeURIComponent(messageId)}`
      )
        .then(showMessageDeletedNotification(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_CREATE_MESSAGE]({ commit, dispatch }, { threadId, content }) {
      return request(
        "POST",
        `/api/forum/thread/${encodeURIComponent(threadId)}/message/`,
        {
          content
        }
      )
        .then(res => res.json())
        .then(res => {
          res.created = new Date(res.created);
          return res;
        })
        .then(res => {
          console.log(res);
          commit(_MUTATION_ADD_MESSAGE, { threadId, message: res });
          return showMessagePostedNotification(dispatch)();
        })
        .catch(showUnexpectedErrorNotification(dispatch));
    },
    [ACTION_TOGGLE_PINNED_THREAD]({ commit, dispatch }, thread) {
      const pinned = thread.pinned;
      commit(_MUTATION_TOGGLE_PINNED_THREAD, thread.id);
      return request(
        "PATCH",
        `/api/forum/thread/${encodeURIComponent(thread.id)}`,
        {
          title: thread.title,
          pinned: !pinned
        }
      )
        .then(showSuccess(`Thread ${pinned ? "un" : ""}pinned!`)(dispatch))
        .catch(showUnexpectedErrorNotification(dispatch));
    }
  }
};
