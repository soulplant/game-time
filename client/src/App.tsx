import * as fb from "firebase";
import React, { useEffect, useReducer } from "react";
import "./App.css";
import { EventList } from "./EventList";

const app = fb.initializeApp({
  apiKey: "AIzaSyCJTjQGSA3TZZzUBHGwSOLT0kEeIQED_yQ",
  authDomain: "ac-dev-project.firebaseapp.com",
  databaseURL: "https://ac-dev-project.firebaseio.com",
  projectId: "ac-dev-project",
  storageBucket: "ac-dev-project.appspot.com",
  messagingSenderId: "76831991180",
  appId: "1:76831991180:web:5884b62d238a516f9ea2a9",
  measurementId: "G-XZ5LHNKDET",
});

const authProvider = new fb.auth.GoogleAuthProvider();

if (window.location.hostname === "localhost") {
  fb.firestore().settings({
    host: "localhost:8080",
    ssl: false,
  });
}

type State =
  | {
      type: "unknown-login-state";
    }
  | {
      type: "logged-in";
      user: fb.User;
    }
  | {
      type: "logged-out";
    };

type Action =
  | {
      type: "logged-in";
      user: fb.User;
    }
  | {
      type: "logged-out";
    };

function isNever(_: never) {}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "logged-in": {
      return { type: "logged-in", user: action.user };
    }
    case "logged-out": {
      return { type: "logged-out" };
    }
    default: {
      isNever(action);
    }
  }
  return state;
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    type: "unknown-login-state",
  });

  const handleAuthStateChange = (user: fb.User | null) => {
    if (user) {
      dispatch({ type: "logged-in", user });
    } else {
      dispatch({ type: "logged-out" });
    }
  };
  useEffect(() => {
    return app.auth().onAuthStateChanged(handleAuthStateChange);
  }, []);
  const loginClicked = async () => {
    const resp = await fb.auth().signInWithPopup(authProvider);
    handleAuthStateChange(resp.user);
  };
  const logoutClicked = async () => {
    await app.auth().signOut();
    handleAuthStateChange(null);
  };
  if (state.type === "unknown-login-state") {
    return <div></div>;
  }
  if (state.type === "logged-out") {
    return <button onClick={loginClicked}>Login</button>;
  }
  if (state.type === "logged-in") {
    return (
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1em",
            margin: "1em",
          }}
        >
          <p>
            Logged in as <em>{state.user.email}</em>
          </p>
          <button onClick={logoutClicked}>Logout</button>
        </div>
        <EventList app={app} />
      </div>
    );
  }
  isNever(state);
  return <div>Bad state</div>;
}

export default App;
