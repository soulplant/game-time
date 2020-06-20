import React from "react";
import { Link } from "react-router-dom";
import * as m from "./model";

export const GroupList: React.FC<{ me: m.User }> = (props) => {
  return (
    <div>
      Starred groups
      <ul>
        {props.me.starredGroupIds.map((id) => (
          <li key={id}>
            <Link to={`/${id}/events`}>{id}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
