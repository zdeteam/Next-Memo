import React from "react";
import "../../less/common/button.less";

interface ButtonProps {
  onClick: () => void;
  children: any;
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button = (props: ButtonProps) => {
  const onClick = () => {
    if (props.disabled) return false;
    props.onClick();
  };
  let styles = {};
  if (props.fullWidth) {
    styles = { width: "100%" };
  }
  return (
    <button style={styles} disabled={props.disabled} className={`button-wrapper ${props.className}`} onClick={onClick}>
      {props.children}
    </button>
  );
};

export default Button;
