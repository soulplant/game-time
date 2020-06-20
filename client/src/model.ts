import * as fb from "firebase";

export type User = {
  starredGroupIds: string[];
};

export function parseUser(doc: fb.firestore.DocumentSnapshot): User {
  const data = doc.data();
  if (!data) {
    return { starredGroupIds: [] };
  }
  if (!data.starredGroupIds) {
    return { starredGroupIds: [] };
  }
  return {
    starredGroupIds: data.starredGroupIds,
  };
}

export type GroupMember = {
  id?: string;
  displayName: string;
};

export function parseGroupMember(
  doc: fb.firestore.DocumentSnapshot
): GroupMember {
  const data = doc.data();
  if (!data) {
    throw Error("no data");
  }
  if (!data.displayName) {
    throw Error("user displayName field missing");
  }
  return {
    id: doc.id,
    displayName: data.displayName,
  };
}

export type MembershipRequest = {
  id?: string;
  displayName: string;
  email: string;
};

export function parseMembershipRequest(
  doc: fb.firestore.DocumentSnapshot
): MembershipRequest {
  const data = doc.data();
  if (!data) {
    throw Error("no data");
  }
  if (!data.displayName) {
    throw Error("no displayName");
  }
  if (!data.email) {
    throw Error("no email");
  }
  return {
    id: doc.id,
    displayName: data.displayName,
    email: data.email,
  };
}

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
