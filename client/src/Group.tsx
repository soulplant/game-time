import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import { EventsPage } from "./EventsPage";
import { useGroup } from "./useGroup";

export const Group: React.FC<{ groupId: string }> = (props) => {
  const [group, dispatch] = useGroup(props.groupId);
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
          <button onClick={() => dispatch({ type: "create" })}>Create?</button>
        </div>
      );
    }
    case "loaded": {
      return (
        <div>
          <h1>Group {props.groupId}</h1>
          <h3>Members</h3>
          <ul>
            {group.users.map((u) => (
              <li>{u.displayName}</li>
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
