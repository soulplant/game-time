import * as fb from "firebase";
import React, { useCallback, useEffect, useState } from "react";
import { EventForm } from "./EventForm";
import * as m from "./model";

function getEvents(fs: fb.firestore.Firestore) {
  return fs.collection("groups").doc("ac-gaming").collection("events");
}

export const EventList: React.FC<{ app: fb.app.App }> = (props) => {
  const eventsCol = getEvents(props.app.firestore());
  const create = async (event: m.Event) => {
    try {
      await eventsCol.add(event);
      await loadEvents();
      return null;
    } catch (e) {
      return "" + e;
    }
  };
  const handleDelete = async (eventId: string) => {
    await eventsCol.doc(eventId).delete();
    await loadEvents();
  };
  const [events, setEvents] = useState<m.Event[]>([]);
  const loadEvents = useCallback(async () => {
    const events = await eventsCol.get();
    const rawEvents = events.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .map(m.parseEvent)
      .filter((e) => e) as m.Event[];
    setEvents(rawEvents);
  }, []);
  useEffect(() => {
    loadEvents();
  }, [props.app, loadEvents]);
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
