export const MODULE_USER = "user";

export const MUTATION_SET_USER = "SET_USER";

export default {
  namespaced: true,
  state: {
    user: null,
    userLoaded: false
  },
  getters: {
    isModerator({ user }) {
      return user && user["https://hr-robocon.org/is_moderator"];
    },
    userAsAuthor({ user }) {
      return user
        ? {
            id: user.sub,
            name: user.nickname,
            picture: user.picture
          }
        : {};
    }
  },
  mutations: {
    [MUTATION_SET_USER](state, user) {
      state.user = user;
      state.userLoaded = true;
    }
  }
};
