import React, { useState } from "react";

export const GroupPicker: React.FC<{
  onSelectGroup: (groupId: string) => void;
}> = (props) => {
  const [groupId, setGroupId] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        props.onSelectGroup(groupId);
      }}
    >
      <input
        type="input"
        value={groupId}
        onChange={(e) => setGroupId(e.currentTarget.value)}
      ></input>
    </form>
  );
};
