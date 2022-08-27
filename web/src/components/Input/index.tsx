import React from "react";
import "./input.less";
interface InputProps {
  label?: string;
  message?: string;
  onChange: (e: any) => void;
  type?: "password" | "text";
  value?: string;
  placeholder?: string;
  fullWidth?: boolean;
}
const Index = (props: InputProps) => {
  const styles: any = {};
  if (props.fullWidth) {
    styles["width"] = "100%";
  }
  return (
    <div className="input-wrapper" style={styles}>
      {props.label && <label>{props.label}</label>}
      <input placeholder={props.placeholder} value={props.value} type={props.type || "text"} onChange={props.onChange} />
      <span className="message">{props.message}</span>
    </div>
  );
};

export default Index;
