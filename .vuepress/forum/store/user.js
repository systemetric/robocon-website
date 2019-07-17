import { request } from "./api";
import {
  showSuccess,
  showWarning,
  showUnexpectedErrorNotification
} from "./notifications";

export const MODULE_USER = "user";

export const MUTATION_SET_USER = "SET_USER";
export const ACTION_REGISTER_USER = "REGISTER_USER";

const showInvalidRegistrationCodeNotification = showWarning(
  "Unknown registration code!"
);

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
    isRegistered({ user }) {
      if (!user) return false;
      const school = user["https://hr-robocon.org/school"];
      const competition = user["https://hr-robocon.org/competition"];
      const host = user["https://hr-robocon.org/host"];
      return !(school === "" || competition === "" || host === "");
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
  },
  actions: {
    async [ACTION_REGISTER_USER]({ dispatch }, registrationCode) {
      const res = await request(
        "POST",
        "/api/register",
        {
          code: registrationCode
        },
        true
      );
      if (res.ok) {
        const body = await res.json();
        const auth = await import("./auth");
        await auth.service.renewTokens();
        showSuccess(`Registered with ${body.host} ${body.competition}!`)(
          dispatch
        )();
      } else if (res.status === 404) {
        showInvalidRegistrationCodeNotification(dispatch)();
      } else {
        showUnexpectedErrorNotification(dispatch)();
      }
    }
  }
};
