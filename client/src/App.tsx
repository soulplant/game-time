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
import { GroupList } from "./GroupList";
import { GroupPicker } from "./GroupPicker";
import { useMe } from "./useMe";

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

  const [me, meDispatch] = useMe(backend);

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
    switch (me.type) {
      case "error": {
        return <div>Failed to load user</div>;
      }
      case "loading": {
        return <div>Loading...</div>;
      }
    }
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
            </ul>
            <GroupList me={me.me} />
            <Switch>
              <Route path="/settings">Settings</Route>
              <Route path="/admin">Admin</Route>
              <Route
                path="/:groupId"
                render={(props: RouteComponentProps<{ groupId: string }>) => (
                  <Group
                    groupId={props.match.params.groupId}
                    user={me.me}
                    userDispatch={meDispatch}
                  ></Group>
                )}
              />
              <Route
                exact
                path="/"
                render={(props) => (
                  <GroupPicker
                    onSelectGroup={(groupId) =>
                      props.history.push(`/${groupId}/events`)
                    }
                  ></GroupPicker>
                )}
              ></Route>
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
