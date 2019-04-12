import firebase from "firebase/app";
import "firebase/firestore";
import { createAuthorObject, invokeFunction } from "../forum/utils";
import * as markdownIt from "markdown-it";

const md = markdownIt({
  highlight: (str, lang) => {
    // NOTE: the "pre-not" tag is used here because it starts with "pre" and prevents
    // markdown-it from inserting boilerplate that already exists in the template.
    // This is manually defined to allow the type of code to be displayed in the corner.
    // noinspection JSUnresolvedVariable, JSUnresolvedFunction
    return `<pre-not><div class="language-${lang} extra-class"><pre class="language-${lang}"><code>${
      lang && lang in self.Prism.languages
        ? self.Prism.highlight(str, self.Prism.languages[lang])
        : md.utils.escapeHtml(str)
    }</code></pre></div></pre-not>`;
  }
});

// noinspection SpellCheckingInspection
const app = (window.app = firebase.initializeApp({
  apiKey: "AIzaSyDZgbkrHJ9lQL9W8xNcXIKNwi7vWv7vysA",
  authDomain: "hr-robocon.firebaseapp.com",
  databaseURL: "https://hr-robocon.firebaseio.com",
  projectId: "hr-robocon",
  storageBucket: "hr-robocon.appspot.com",
  messagingSenderId: "581758654575"
}));

/*
 * FIRESTORE
 */
export const db = app.firestore();
db.settings({
  timestampsInSnapshots: true
});

export const threadsRef = db.collection("threads");

export const userCodesRef = db.doc("meta/usercodes");

async function getAuth() {
  return import("./auth").then(({ auth }) => auth);
}

export async function createThread(title, message, user) {
  // noinspection JSUnresolvedFunction
  return await invokeFunction({
    auth: await getAuth(),
    method: "POST",
    name: "post",
    body: {
      author: createAuthorObject(user),
      title: title,
      content: message,
      renderedContent: md.render(message)
    }
  });
}

export async function createMessage(
  threadId,
  threadName,
  message,
  user,
  users
) {
  const author = createAuthorObject(user);

  const otherUsers = [];
  users
    .filter(user => user.uid !== author.uid)
    .forEach(user => {
      if (!otherUsers.some(test => test.email === user.email)) {
        otherUsers.push(user);
      }
    });

  // noinspection JSUnresolvedFunction
  return await invokeFunction({
    auth: await getAuth(),
    method: "PUT",
    name: "post",
    body: {
      author: author,
      threadId: threadId,
      threadTitle: threadName,
      content: message,
      renderedContent: md.render(message),
      otherUsers: otherUsers
    }
  });
}

export async function updateMessage(threadId, messageId, content) {
  // noinspection JSUnresolvedFunction
  return await invokeFunction({
    auth: await getAuth(),
    method: "PATCH",
    name: "post",
    body: {
      threadId: threadId,
      messageId: messageId,
      content: content,
      renderedContent: md.render(content)
    }
  });
}

export async function deleteMessage(threadId, messageId) {
  return await invokeFunction({
    auth: await getAuth(),
    method: "DELETE",
    name: "post",
    body: {
      threadId: threadId,
      messageId: messageId
    }
  });
}

export async function verifyRegistrationCode(code) {
  return await invokeFunction({
    auth: await getAuth(),
    method: "PATCH",
    name: "verify",
    body: {
      code: code
    }
  }).then(res => {
    if (res.ok) {
      return {
        valid: true,
        message: "You can now post on the forums."
      };
    } else {
      return {
        valid: false,
        message:
          "That registration code has expired or never existed in the first place."
      };
    }
  });
}
