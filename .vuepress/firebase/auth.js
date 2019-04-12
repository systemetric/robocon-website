import firebase from "firebase/app";
import "firebase/auth";

/*
 * AUTHENTICATION
 */
export const auth = (window.auth = window.app.auth());

const providers = {
  google: new firebase.auth.GoogleAuthProvider(),
  github: new firebase.auth.GithubAuthProvider()
};

export function signIn(provider) {
  return auth.signInWithPopup(providers[provider]);
}

export const signOut = (window.signOut = function() {
  return auth.signOut();
});
