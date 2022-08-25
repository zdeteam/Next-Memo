import React, { useEffect, useState } from "react";
import { GoX } from "react-icons/go";
import "../../less/common/modal.less";

interface ModalProps {
  children?: any;
  onClose?: () => void;
  closeable?: boolean;
  visible: boolean;
}

const Modal = (props: ModalProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log(111);
    setVisible(props.visible);
  }, [props.visible]);

  if (!visible) return null;

  return (
    <div className="modal-wrapper">
      <div>
        {props.closeable && (
          <div className="header">
            <GoX
              onClick={() => {
                props.onClose && props.onClose();
              }}
            />
          </div>
        )}
        <div className="modal">{props.children}</div>
      </div>
    </div>
  );
};

export default Modal;
