export const createAuthorObject = user => ({
  uid: user.uid,
  email: user.email,
  name: user.displayName,
  photo: user.photoURL
});

const BASE_URL =
  process.env.NODE_ENV === "development" ? "http://localhost:9000" : "";

export function invokeFunction({ auth, method, name, body }) {
  return auth.currentUser.getIdToken().then(idToken =>
    fetch(`${BASE_URL}/.netlify/functions/${name}`, {
      method: method,
      headers: {
        Authorization: `Bearer ${idToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
  );
}
