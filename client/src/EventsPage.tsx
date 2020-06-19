import React, { useCallback, useEffect, useReducer } from "react";
import { useBackend } from "./backend";
import { EventForm } from "./EventForm";
import * as m from "./model";
import { Popup } from "./Popup";

type State =
  | {
      type: "loading";
    }
  | {
      type: "loaded";
      events: m.Event[];
      showingEventId: string | null;
    };

type Action =
  | {
      type: "events-loaded";
      events: m.Event[];
    }
  | {
      type: "show-event";
      eventId: string;
    }
  | {
      type: "close-popup";
    };

const initialState: State = {
  type: "loading",
};

function getShowingEvent(state: State): string | null {
  return state.type === "loaded" ? state.showingEventId : null;
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "events-loaded": {
      return {
        type: "loaded",
        events: action.events,
        showingEventId: getShowingEvent(state),
      };
    }
    case "show-event": {
      if (state.type === "loading") {
        return state;
      }
      return { ...state, showingEventId: action.eventId };
    }
    case "close-popup": {
      if (state.type === "loading") {
        return state;
      }
      return { ...state, showingEventId: null };
    }
    default: {
      isNever(action);
      return state;
    }
  }
};

function isNever(_: never) {}

export const EventsPage: React.FC<{ groupId: string }> = (props) => {
  const backend = useBackend();
  const create = async (event: m.Event) => {
    try {
      await backend.addEvent(props.groupId, event);
      await loadEvents();
      return null;
    } catch (e) {
      return "" + e;
    }
  };
  const save = async (event: m.Event) => {
    try {
      await backend.saveEvent(props.groupId, event);
      await loadEvents();
      return null;
    } catch (e) {
      return "" + e;
    }
  };
  const [state, dispatch] = useReducer(reducer, initialState);

  const handleDelete = async (eventId: string) => {
    await backend.deleteEvent(props.groupId, eventId);
    await loadEvents();
  };

  const loadEvents = useCallback(async () => {
    const events = await backend.getEvents(props.groupId);
    dispatch({ type: "events-loaded", events });
  }, [backend, props.groupId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  switch (state.type) {
    case "loading": {
      return <div></div>;
    }
    case "loaded": {
      return (
        <div>
          <h1>Events</h1>
          <ul>
            {state.events.map((e) => (
              <li key={e.id}>
                {e.id} / {e.title} /{" "}
                <button
                  onClick={() =>
                    dispatch({ type: "show-event", eventId: e.id! })
                  }
                >
                  Show
                </button>
                <button onClick={() => handleDelete(e.id!)}>Delete</button>
              </li>
            ))}
          </ul>
          <h1>Create</h1>
          <EventForm create={true} onSave={create}></EventForm>
          {state.showingEventId && (
            <Popup>
              <EventForm
                create={false}
                proto={state.events.find((e) => e.id === state.showingEventId)}
                onSave={save}
              ></EventForm>
              <button onClick={() => dispatch({ type: "close-popup" })}>
                Close
              </button>
            </Popup>
          )}
        </div>
      );
    }
    default: {
      isNever(state);
    }
  }
  return <div></div>;
};
