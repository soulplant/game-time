import * as fb from "firebase";
import { firestore } from "firebase";
import * as m from "./model";

export const app = fb.initializeApp({
  apiKey: "AIzaSyCJTjQGSA3TZZzUBHGwSOLT0kEeIQED_yQ",
  authDomain: "ac-dev-project.firebaseapp.com",
  databaseURL: "https://ac-dev-project.firebaseio.com",
  projectId: "ac-dev-project",
  storageBucket: "ac-dev-project.appspot.com",
  messagingSenderId: "76831991180",
  appId: "1:76831991180:web:5884b62d238a516f9ea2a9",
  measurementId: "G-XZ5LHNKDET",
});

export const authProvider = new fb.auth.GoogleAuthProvider();

export class Backend {
  constructor(private fs: firestore.Firestore) {}

  private events() {
    return this.fs.collection("groups").doc("ac-gaming").collection("events");
  }

  async addEvent(event: m.Event): Promise<void> {
    await this.events().add(event);
  }

  async saveEvent(event: m.Event): Promise<void> {
    await this.events().doc(event.id).update({ title: event.title });
  }

  async getEvents(): Promise<m.Event[]> {
    const eventCol = this.fs
      .collection("groups")
      .doc("ac-gaming")
      .collection("events");
    const resp = await eventCol.get();
    return resp.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .map(m.parseEvent)
      .filter((e) => e) as m.Event[];
  }

  async deleteEvent(eventId: string): Promise<void> {
    await this.events().doc(eventId).delete();
  }
}

export const backend = new Backend(firestore());
