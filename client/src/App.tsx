import * as fb from "firebase";
import React, { useEffect, useReducer } from "react";
import "./App.css";
import { app, authProvider } from "./backend";
import { EventList } from "./EventList";

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
        <EventList />
      </div>
    );
  }
  isNever(state);
  return <div>Bad state</div>;
}

export default App;
