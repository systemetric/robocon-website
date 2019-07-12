const API_BASE_URL = "https://robocon.mrbbot.co.uk";
//const API_BASE_URL = "http://localhost:8085";

export function getAuthorizationHeaders() {
  return import("./auth")
    .then(auth => auth.service.getIdToken())
    .then(token => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }));
}

export async function request(method, route, body) {
  const options = { method };
  if (body) options.body = JSON.stringify(body);
  if (method !== "GET") options.headers = await getAuthorizationHeaders();
  console.log("Fetch:", API_BASE_URL + route, options);
  return fetch(API_BASE_URL + route, options);
}
