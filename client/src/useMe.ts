import { useCallback, useEffect, useReducer } from "react";
import { Backend } from "./backend";
import * as m from "./model";

export type State =
  | { type: "loaded"; me: m.User }
  | { type: "error"; message: string }
  | { type: "loading" };

const loadingState: State = { type: "loading" };

type Action =
  | {
      type: "reloading";
    }
  | {
      type: "star-group";
      groupId: string;
    }
  | {
      type: "unstar-group";
      groupId: string;
    }
  | {
      type: "loaded";
      me: m.User;
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
      return { type: "loaded", me: action.me };
    }
    case "reloading": {
      return loadingState;
    }
    case "star-group": {
      if (state.type === "loaded") {
        return {
          ...state,
          me: {
            starredGroupIds: [...state.me.starredGroupIds, action.groupId],
          },
        };
      }
      return loadingState;
    }
    case "unstar-group": {
      if (state.type === "loaded") {
        return {
          ...state,
          me: {
            starredGroupIds: state.me.starredGroupIds.filter(
              (id) => id !== action.groupId
            ),
          },
        };
      }
      return loadingState;
    }
    default: {
      isNever(action);
      return state;
    }
  }
};

export type Dispatch = (action: Action) => Promise<void>;

export const useMe = (backend: Backend | null) => {
  const [state, dispatch] = useReducer(reducer, loadingState);

  const loadMe = useCallback(async (backend: Backend) => {
    try {
      const me = await backend.getMe();
      dispatch({ type: "loaded", me });
    } catch (e) {
      dispatch({ type: "load-failed", message: e + "" });
    }
  }, []);

  useEffect(() => {
    if (!backend) {
      return;
    }
    loadMe(backend);
  }, [loadMe, backend]);

  const dispatch2: Dispatch = useCallback(
    async (action: Action) => {
      switch (action.type) {
        case "star-group": {
          if (!backend) {
            throw Error("backend not loaded");
          }
          if (state.type !== "loaded") {
            throw Error("user not loaded");
          }
          dispatch(action);
          await backend.starGroup(action.groupId);
          await loadMe(backend);
          break;
        }
        case "unstar-group": {
          if (!backend) {
            throw Error("backend not loaded");
          }
          if (state.type !== "loaded") {
            throw Error("user not loaded");
          }
          dispatch(action);
          await backend.unstarGroup(action.groupId);
          await loadMe(backend);
          break;
        }
        default: {
          dispatch(action);
        }
      }
    },
    [backend, loadMe, state]
  );

  return [state, dispatch2] as const;
};
