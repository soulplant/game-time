import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { EventsPage } from "./EventsPage";
import * as m from "./model";
import { useGroup } from "./useGroup";
import * as me from "./useMe";

export const Group: React.FC<{
  groupId: string;
  user: m.User;
  userDispatch: me.Dispatch;
}> = (props) => {
  const [group, dispatch] = useGroup(props.groupId);

  const starGroup = async () => {
    await props.userDispatch({ type: "star-group", groupId: props.groupId });
  };
  const unstarGroup = async () => {
    await props.userDispatch({ type: "unstar-group", groupId: props.groupId });
  };
  const createGroup = async () => {
    await dispatch({ type: "create" });
    await starGroup();
  };

  const starred = props.user.starredGroupIds.includes(props.groupId);
  switch (group.type) {
    case "error": {
      return <div>Failed to load group: {group.message}</div>;
    }
    case "loading": {
      return <div>Loading...</div>;
    }
    case "not-found": {
      return (
        <div>
          Group {props.groupId} doesn't exist.{" "}
          <button onClick={createGroup}>Create?</button>
        </div>
      );
    }
    case "loaded": {
      return (
        <div>
          <h1>Group {props.groupId}</h1>
          {starred ? (
            <button onClick={unstarGroup}>Unstar</button>
          ) : (
            <button onClick={starGroup}>Star</button>
          )}

          <h3>Members</h3>
          <ul>
            {group.users.map((u) => (
              <li key={u.id}>{u.displayName}</li>
            ))}
          </ul>
          <Switch>
            <Route exact path={`/${props.groupId}/events`}>
              <EventsPage groupId={props.groupId}></EventsPage>
            </Route>
            <Route>
              <Redirect to={`/${props.groupId}/events`}></Redirect>
            </Route>
          </Switch>
        </div>
      );
    }
  }
};
