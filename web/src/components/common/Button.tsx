import React from "react";
import "../../less/common/button.less";

interface ButtonProps {
  onClick: () => void;
  children: any;
  className: string;
}

const Button = (props: ButtonProps) => {
  return (
    <button className={`button-wrapper ${props.className}`} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

export default Button;
