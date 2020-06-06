import * as fb from "firebase";

export type Event = {
  id?: string;
  title: string;
};

export function parseEvent(data: fb.firestore.DocumentData): Event | null {
  if (!data.title) {
    return null;
  }
  if (!data.id) {
    return null;
  }
  return { id: data.id, title: data.title || "" };
}
