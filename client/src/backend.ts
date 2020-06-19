import * as fb from "firebase";
import { firestore } from "firebase";
import React, { useContext } from "react";
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

export const BackendContext = React.createContext<Backend | null>(null);

const kGroups = "groups";
const kMembers = "members";
const kEvents = "events";
const kAttendees = "attendees";
const kMembershipRequests = "membership-requests";

export const useBackend = () => {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw Error("no backend");
  }
  return backend;
};

export class Backend {
  constructor(private fs: firestore.Firestore, private user: fb.User) {}

  private events(groupId: string) {
    return this.fs.collection(kGroups).doc(groupId).collection(kEvents);
  }

  private group(groupId: string) {
    return this.fs.collection(kGroups).doc(groupId);
  }

  async getGroupExists(groupId: string): Promise<boolean> {
    const group = await this.group(groupId).get();
    return group.exists;
  }

  async addEvent(groupId: string, event: m.Event): Promise<void> {
    await this.events(groupId).add(event);
  }

  async saveEvent(groupId: string, event: m.Event): Promise<void> {
    await this.events(groupId).doc(event.id).update({ title: event.title });
  }

  async registerAttendance(groupId: string, eventId: string): Promise<void> {
    await this.events(groupId)
      .doc(eventId)
      .collection(kAttendees)
      .doc(this.user.uid)
      .set({});
  }

  async unregisterAttendance(groupId: string, eventId: string): Promise<void> {
    await this.events(groupId)
      .doc(eventId)
      .collection(kAttendees)
      .doc(this.user.uid)
      .delete();
  }

  async getEvents(groupId: string): Promise<m.Event[]> {
    const eventCol = this.fs
      .collection(kGroups)
      .doc(groupId)
      .collection(kEvents);
    const resp = await eventCol.get();
    return resp.docs
      .map((doc) => ({ ...doc.data(), id: doc.id }))
      .map(m.parseEvent)
      .filter((e) => e) as m.Event[];
  }

  async deleteEvent(groupId: string, eventId: string): Promise<void> {
    await this.events(groupId).doc(eventId).delete();
  }

  async getGroupMembers(groupId: string): Promise<m.User[]> {
    const members = await this.group(groupId).collection(kMembers).get();
    return members.docs.map(m.parseUser);
  }

  async createGroup(groupId: string): Promise<void> {
    if (!this.user.displayName) {
      throw Error("current user doesn't have displayName set");
    }
    await this.group(groupId).set({
      creator: this.user.uid,
    });
    await this.fs
      .collection(kGroups)
      .doc(groupId)
      .collection(kMembers)
      .doc(this.user.uid)
      .set({ displayName: this.user.displayName, admin: true });
  }

  async requestGroupAccess(groupId: string): Promise<void> {
    await this.group(groupId)
      .collection(kMembershipRequests)
      .doc(this.user.uid)
      .set({
        displayName: this.user.displayName,
        email: this.user.email,
      });
  }

  async getAccessRequests(groupId: string): Promise<m.MembershipRequest[]> {
    const reqs = await this.group(groupId)
      .collection(kMembershipRequests)
      .get();
    return reqs.docs.map(m.parseMembershipRequest);
  }
}
