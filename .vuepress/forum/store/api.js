const API_BASE_URL = "https://robocon.mrbbot.co.uk";
// const API_BASE_URL = "http://localhost:8085";

export const ACTION_REQUEST = "REQUEST";

export function getAuthorizationHeaders() {
  return import("../auth")
    .then(auth => auth.service.getIdToken())
    .then(token => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }));
}

export default {
  actions: {
    async [ACTION_REQUEST](context, { method, route, body }) {
      const options = {};
      if (method) options.method = method;
      if (body) options.body = JSON.stringify(body);
      if (method && method !== "GET")
        options.headers = await getAuthorizationHeaders();
      console.log(API_BASE_URL + route, options);
      return (
        fetch(API_BASE_URL + route, options)
          .then(res => res.json())
          //TODO: show error to user
          .catch(err => console.error(err))
      );
    }
  }
};
