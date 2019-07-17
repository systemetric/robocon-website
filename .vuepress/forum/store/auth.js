import { WebAuth } from "auth0-js";
import EventEmitter from "events";

const webAuth = new WebAuth({
  domain: "robotics.eu.auth0.com",
  redirectUri: `${window.location.origin}/forum/`,
  clientID: "POA0CxRyGzbOhE7dOtjsDyNsOwNqC14l",
  responseType: "id_token", //token
  scope: "openid profile email"
});
const logoutReturnTo = `${window.location.origin}/forum/`;

class AuthService extends EventEmitter {
  idToken = null;
  idTokenExp = null;

  // noinspection JSMethodCanBeStatic
  login() {
    webAuth.authorize();
  }

  loginSilently() {
    window.auth = this;
    if (window.location.hash.includes("_token=")) {
      this._parseHash().then(() => (window.location.hash = ""));
    } else {
      this.renewTokens().catch(err => {
        console.error(err);
        this.emit("user", null);
      });
    }
  }

  logout() {
    this.emit("user", null);
    webAuth.logout({
      returnTo: logoutReturnTo
    });
  }

  getIdToken() {
    return new Promise((resolve, reject) => {
      if (this._isIdTokenValid()) {
        // console.log("token valid");
        resolve(this.idToken);
      } else {
        // console.log("token invalid");
        this.renewTokens().then(authResult => {
          resolve(authResult.idToken);
        }, reject);
      }
    });
  }

  renewTokens() {
    return new Promise((resolve, reject) => {
      webAuth.checkSession({}, (err, authResult) => {
        err ? reject(err) : resolve(this._handleAuthResult(authResult));
      });
    });
  }

  _isIdTokenValid() {
    return (
      this.idToken && this.idTokenExp && Date.now() + 30000 < this.idTokenExp
    );
  }

  _parseHash() {
    return new Promise((resolve, reject) => {
      webAuth.parseHash({}, (err, authResult) => {
        err ? reject(err) : resolve(this._handleAuthResult(authResult));
      });
    });
  }

  _handleAuthResult(authResult) {
    this.idToken = authResult.idToken;
    this.idTokenExp = authResult.idTokenPayload.exp * 1000;

    this.emit("user", authResult.idTokenPayload);

    return authResult;
  }
}

const service = new AuthService();
export { service };
