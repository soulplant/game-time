import * as fb from "firebase";
import React, { useEffect, useMemo, useReducer } from "react";
import {
  BrowserRouter,
  Link,
  Redirect,
  Route,
  RouteComponentProps,
  Switch,
} from "react-router-dom";
import "./App.css";
import { app, authProvider, Backend, BackendContext } from "./backend";
import { Group } from "./Group";

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

const getLoggedInUser = (state: State) => {
  return state.type === "logged-in" ? state.user : null;
};

function isNever(_: never) {}

function App() {
  const [state, dispatch] = useReducer(reducer, {
    type: "unknown-login-state",
  });
  const user = getLoggedInUser(state);

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

  const backend = useMemo(() => {
    if (!user) {
      return null;
    }
    return new Backend(fb.firestore(), user);
  }, [user]);

  const loginClicked = async () => {
    const resp = await fb.auth().signInWithPopup(authProvider);
    handleAuthStateChange(resp.user);
  };
  const logoutClicked = async () => {
    await app.auth().signOut();
    handleAuthStateChange(null);
  };
  if (state.type === "unknown-login-state") {
    return <div>Unknown</div>;
  }
  if (state.type === "logged-out") {
    return <button onClick={loginClicked}>Login</button>;
  }
  if (state.type === "logged-in") {
    return (
      <BackendContext.Provider value={backend}>
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
          <BrowserRouter>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/ac-gaming/events">AC Gaming</Link>
              </li>
              <li>
                <Link to="/stuff/events">Stuff</Link>
              </li>
            </ul>
            <Switch>
              <Route path="/settings">Settings</Route>
              <Route path="/admin">Admin</Route>
              <Route
                path="/:groupId"
                render={(props: RouteComponentProps<{ groupId: string }>) => (
                  <Group groupId={props.match.params.groupId}></Group>
                )}
              />
              <Route>
                <Redirect to="/ac-gaming/events"></Redirect>
              </Route>
            </Switch>
          </BrowserRouter>
        </div>
      </BackendContext.Provider>
    );
  }
  isNever(state);
  return <div>Bad state</div>;
}

export default App;
