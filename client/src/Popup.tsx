import React from "react";

export const Popup: React.FC<{ onClickOutside?: () => void }> = (props) => {
  return (
    <div onClick={props.onClickOutside}>
      <div
        style={{
          position: "fixed",
          top: "0",
          bottom: "0",
          left: "0",
          right: "0",
          backgroundColor: "rgba(0,0,0,0.4)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "relative",
            backgroundColor: "white",
            padding: "1em",
            borderRadius: "4px",
            border: "solid 1px black",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          {props.children}
        </div>
      </div>
    </div>
  );
};
