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

const defaultProto: m.Event = {
  title: "",
};

export const EventForm: React.FC<{
  create: boolean;
  proto?: m.Event;
  onSave: (event: m.Event) => Promise<string | null>;
}> = (props) => {
  const proto = props.proto || defaultProto;
  const [id] = useState<string | undefined>(proto ? proto.id : undefined);
  const [title, setTitle] = useState(proto ? proto.title : "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const data: m.Event = { title };
      if (!props.create) {
        data.id = id;
      }
      const resp = await props.onSave(data);
      if (resp) {
        setError(resp);
      }
    } catch (e) {
      setError(e + "");
    } finally {
      setSaving(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <div style={{ minWidth: "600px" }}>
      {saving && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "white",
            opacity: "0.4",
          }}
        ></div>
      )}
      {error && (
        <ErrorCard>
          Error: {error}
          <button onClick={clearError}>Ok</button>
        </ErrorCard>
      )}
      {!props.create && <h1>{title}</h1>}
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
        <input type="submit" value={props.create ? "Create" : "Save"}></input>
      </form>
    </div>
  );
};
