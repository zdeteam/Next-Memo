import React from "react";
import "./button.less";

interface ButtonProps {
  onClick: () => void;
  children: any;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "L" | "M";
  type?: "text" | "danger";
}

const Button = (props: ButtonProps) => {
  const onClick = () => {
    if (props.disabled) return false;
    props.onClick();
  };
  let styles: any = {};
  if (props.fullWidth) {
    styles = { width: "100%" };
  }
  if (props.size === "L") {
    styles["height"] = "36px";
  }
  if (props.type === "text") {
    styles["color"] = "#000";
    styles["padding"] = "0 4px";
    styles["fontWeight"] = "400";
    styles["backgroundColor"] = "#fff";
  }
  if (props.type === "danger") {
    styles["color"] = "rgb(220, 38, 38)";
    styles["backgroundColor"] = "rgb(254, 242, 242)";
  }

  return (
    <button style={styles} disabled={props.disabled} className={`button-wrapper ${props.className}`} onClick={onClick}>
      {props.children}
    </button>
  );
};

export default Button;
