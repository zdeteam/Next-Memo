import React from "react";
import "../../less/common/input.less";
interface InputProps {
  label?: string;
  message?: string;
  onChange: (e: any) => void;
  type?: "password" | "text";
}
const Input = (props: InputProps) => {
  return (
    <div className="input-wrapper">
      {props.label && <label>{props.label}</label>}
      <input type={props.type || "text"} onChange={props.onChange} />
      <span className="message">{props.message}</span>
    </div>
  );
};

export default Input;
