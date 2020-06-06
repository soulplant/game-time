import React, { useCallback, useEffect, useState } from "react";
import { backend } from "./backend";
import { EventForm } from "./EventForm";
import * as m from "./model";

export const EventList: React.FC = (props) => {
  const create = async (event: m.Event) => {
    try {
      await backend.addEvent(event);
      await loadEvents();
      return null;
    } catch (e) {
      return "" + e;
    }
  };
  const handleDelete = async (eventId: string) => {
    await backend.deleteEvent(eventId);
    await loadEvents();
  };
  const [events, setEvents] = useState<m.Event[]>([]);
  const loadEvents = useCallback(async () => {
    const events = await backend.getEvents();
    setEvents(events);
  }, []);
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);
  return (
    <div>
      <h1>Events</h1>
      <ul>
        {events.map((e) => (
          <li key={e.id}>
            {e.id} / {e.title} /{" "}
            <button onClick={() => handleDelete(e.id!)}>Delete</button>
          </li>
        ))}
      </ul>
      <h1>Create</h1>
      <EventForm onCreate={create}></EventForm>
    </div>
  );
};
