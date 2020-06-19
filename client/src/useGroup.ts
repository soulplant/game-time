import { useCallback, useEffect, useReducer } from "react";
import { useBackend } from "./backend";
import * as m from "./model";

export type State =
  | { type: "loaded"; users: m.User[] }
  | { type: "error"; message: string }
  | { type: "not-found" }
  | { type: "loading" };

const loadingState: State = { type: "loading" };
const notFoundState: State = { type: "not-found" };

type Action =
  | {
      type: "reloading";
    }
  | {
      type: "create";
    }
  | {
      type: "not-found";
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
    case "not-found": {
      return notFoundState;
    }
    case "create": {
      return loadingState;
    }
    default: {
      isNever(action);
      return state;
    }
  }
};

export const useGroup = (groupId: string): [State, React.Dispatch<Action>] => {
  const backend = useBackend();
  const [state, dispatch] = useReducer(reducer, loadingState);

  const loadGroup = useCallback(async () => {
    try {
      const exists = await backend.getGroupExists(groupId);
      if (!exists) {
        dispatch({ type: "not-found" });
        return;
      }
      const users = await backend.getGroupMembers(groupId);
      dispatch({ type: "loaded", users });
    } catch (e) {
      dispatch({ type: "load-failed", message: e + "" });
    }
  }, [backend, groupId]);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const dispatch2: typeof dispatch = useCallback(
    async (action) => {
      switch (action.type) {
        case "create": {
          dispatch(action);
          await backend.createGroup(groupId);
          await loadGroup();
          break;
        }
        default: {
          dispatch(action);
        }
      }
    },
    [backend, groupId, loadGroup]
  );

  return [state, dispatch2];
};
