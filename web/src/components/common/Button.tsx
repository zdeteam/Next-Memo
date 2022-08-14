import React from "react";
import "../../less/common/button.less";

interface ButtonProps {
  onClick: () => void;
  children: any;
}

const Button = (props: ButtonProps) => {
  return (
    <div className="button-wrapper" onClick={props.onClick}>
      {props.children}
    </div>
  );
};

export default Button;
