import React, { useState } from "react";
import * as m from "./model";

const ErrorCard: React.FC = (props) => {
  return (
    <div
      style={{
        border: "solid 1px red",
        borderRadius: "4px",
        padding: "1em",
        margin: "1em",
        maxWidth: "400px",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {props.children}
    </div>
  );
};

export const EventForm: React.FC<{
  onCreate: (event: m.Event) => Promise<string | null>;
}> = (props) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
  };

  const handleSubmit = async () => {
    const resp = await props.onCreate({ title });
    if (resp) {
      setError(resp);
    } else {
      reset();
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div>
      {error && (
        <ErrorCard>
          Error: {error}
          <button onClick={clearError}>Ok</button>
        </ErrorCard>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <label>
          Title
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          ></input>
        </label>
        <input type="submit"></input>
      </form>
    </div>
  );
};
