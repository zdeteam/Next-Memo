import React from "react";
import "../../less/common/modal.less";
interface ModalProps {
  children?: any;
  visible: boolean;
}

const Modal = (props: ModalProps) => {
  if (!props.visible) return null;
  return (
    <div className="modal">
      <div>{props.children}</div>
    </div>
  );
};

export default Modal;
