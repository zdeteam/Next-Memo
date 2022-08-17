import { forwardRef, ReactNode, useCallback, useEffect, useImperativeHandle, useRef } from "react";
import Write from "@strapi/icons/Write";

import { Icon } from "@strapi/design-system/Icon";
import useRefresh from "../../hooks/useRefresh";
import Only from "../common/OnlyWhen";
import "../../less/editor.less";

export interface EditorRefActions {
  element: HTMLTextAreaElement;
  focus: FunctionType;
  insertText: (text: string) => void;
  setContent: (text: string) => void;
  getContent: () => string;
}

interface EditorProps {
  className: string;
  initialContent: string;
  placeholder: string;
  fullscreen: boolean;
  showConfirmBtn: boolean;
  showCancelBtn: boolean;
  tools?: ReactNode;
  onConfirmBtnClick: (content: string) => void;
  onCancelBtnClick: () => void;
  onContentChange: (content: string) => void;
}

// eslint-disable-next-line react/display-name
const Editor = forwardRef((props: EditorProps, ref: React.ForwardedRef<EditorRefActions>) => {
  const {
    className,
    initialContent,
    placeholder,
    fullscreen,
    showConfirmBtn,
    showCancelBtn,
    onConfirmBtnClick: handleConfirmBtnClickCallback,
    onCancelBtnClick: handleCancelBtnClickCallback,
    onContentChange: handleContentChangeCallback,
  } = props;
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const refresh = useRefresh();

  useEffect(() => {
    if (editorRef.current && initialContent) {
      editorRef.current.value = initialContent;
    }
  }, []);

  useEffect(() => {
    if (editorRef.current && !fullscreen) {
      editorRef.current.style.height = "auto";
      editorRef.current.style.height = (editorRef.current.scrollHeight ?? 0) + "px";
    }
  }, [editorRef.current?.value, fullscreen]);

  useImperativeHandle(
    ref,
    () => ({
      element: editorRef.current as HTMLTextAreaElement,
      focus: () => {
        editorRef.current?.focus();
      },
      insertText: (rawText: string) => {
        if (!editorRef.current) {
          return;
        }

        const prevValue = editorRef.current.value;
        editorRef.current.value =
          prevValue.slice(0, editorRef.current.selectionStart) + rawText + prevValue.slice(editorRef.current.selectionStart);
        handleContentChangeCallback(editorRef.current.value);
        refresh();
      },
      setContent: (text: string) => {
        if (editorRef.current) {
          editorRef.current.value = text;
          handleContentChangeCallback(editorRef.current.value);
          refresh();
        }
      },
      getContent: (): string => {
        return editorRef.current?.value ?? "";
      },
    }),
    []
  );

  const handleEditorInput = useCallback(() => {
    handleContentChangeCallback(editorRef.current?.value ?? "");
    refresh();
  }, []);

  const handleEditorKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    event.stopPropagation();

    if (event.code === "Enter") {
      if (event.metaKey || event.ctrlKey) {
        handleCommonConfirmBtnClick();
      }
    }
  }, []);

  const handleCommonConfirmBtnClick = useCallback(() => {
    if (!editorRef.current) {
      return;
    }
    if (editorRef.current?.value === "") {
      return;
    }

    handleConfirmBtnClickCallback(editorRef.current.value);
    editorRef.current.value = "";
  }, []);

  const handleCommonCancelBtnClick = useCallback(() => {
    handleCancelBtnClickCallback();
  }, []);

  return (
    <div className={"common-editor-wrapper " + className}>
      <textarea
        className="common-editor-inputer"
        rows={1}
        placeholder={placeholder}
        ref={editorRef}
        onInput={handleEditorInput}
        onKeyDown={handleEditorKeyDown}
      ></textarea>
      <div className="common-tools-wrapper">
        <div className="common-tools-container">
          <Only when={props.tools !== undefined}>{props.tools}</Only>
        </div>
        <div className="btns-container">
          <Only when={showCancelBtn}>
            <button className="action-btn cancel-btn" onClick={handleCommonCancelBtnClick}>
              Cancel editting
            </button>
          </Only>
          <Only when={showConfirmBtn}>
            <Icon className="confirm-btn" onClick={handleCommonConfirmBtnClick} width="1.4rem" height="1.4rem" as={Write} />
          </Only>
        </div>
      </div>
    </div>
  );
});

export default Editor;
