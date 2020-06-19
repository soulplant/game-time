import { useEffect, useReducer } from "react";
import { useBackend } from "./backend";
import * as m from "./model";

type State =
  | { type: "loaded"; users: m.User[] }
  | { type: "error"; message: string }
  | { type: "loading" };

const loadingState: State = { type: "loading" };

type Action =
  | {
      type: "reloading";
    }
  | {
      type: "loaded";
      users: m.User[];
    }
  | {
      type: "load-failed";
      message: string;
    };

function isNever(n: never) {}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "load-failed": {
      return { type: "error", message: action.message };
    }
    case "loaded": {
      return { type: "loaded", users: action.users };
    }
    case "reloading": {
      return loadingState;
    }
    default: {
      isNever(action);
      return state;
    }
  }
};

export const useGroup = (groupId: string) => {
  const backend = useBackend();
  const [state, dispatch] = useReducer(reducer, loadingState);

  useEffect(() => {
    const loadGroup = async () => {
      try {
        const users = await backend.getGroupMembers(groupId);
        dispatch({ type: "loaded", users });
      } catch (e) {
        dispatch({ type: "load-failed", message: e + "" });
      }
    };
    loadGroup();
  }, [backend, groupId]);

  return state;
};
