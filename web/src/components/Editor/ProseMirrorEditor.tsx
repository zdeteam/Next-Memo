import React, { useEffect, useRef } from "react";
import { GoBold, GoListOrdered, GoListUnordered, GoTasklist, GoFileMedia } from "react-icons/go";
import { EditorContent, useEditor } from "@tiptap/react";
import Document from "@tiptap/extension-document";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import OrderedList from "@tiptap/extension-ordered-list";
import Bold from "@tiptap/extension-bold";

import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";

import "../../less/prosemirror-editor.less";
import { editorStateService, locationService, memoService } from "../../services";
import { UNKNOWN_ID } from "../../helpers/consts";
import toastHelper from "../Toast";
import { useAppSelector } from "../../store";
import { EditorRefActions } from "./Editor";

interface ProseMirrorEditorProps {
  content?: string;
  editable: boolean;
  cardMode?: boolean;
  onCancel?: () => void;
}
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        <GoBold />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <GoListOrdered />
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <GoListUnordered />
      </button>
      <button onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <GoTasklist />
      </button>
      {/*<button>*/}
      {/*  <GoFileMedia />*/}
      {/*</button>*/}
    </>
  );
};

const ProseMirrorEditor = function (
  props: ProseMirrorEditorProps = {
    editable: true,
  }
) {
  console.log(props.editable);
  const editorState = useAppSelector((state) => state.editor);
  const editorRef = useRef<EditorRefActions>(null);
  const prevGlobalStateRef = useRef(editorState);

  useEffect(() => {
    if (editorState.markMemoId && editorState.markMemoId !== UNKNOWN_ID&&!props.cardMode) {
      const editorCurrentValue = editorRef.current?.getContent();
      const memoLinkText = `${editorCurrentValue ? "\n" : ""}Mark: @[MEMO](${editorState.markMemoId})`;
      editor?.commands.setContent(memoLinkText);
      editorStateService.clearMarkMemo();
    }

    // if (
    //   editorState.editMemoId &&
    //   editorState.editMemoId !== UNKNOWN_ID &&
    //   editorState.editMemoId !== prevGlobalStateRef.current.editMemoId
    // ) {
    //   const editMemo = memoService.getMemoById(editorState.editMemoId ?? UNKNOWN_ID);
    //   if (editMemo) {
    //     editor?.commands.setContent(editMemo.content);
    //   }
    // }

    prevGlobalStateRef.current = editorState;
  }, [editorState.markMemoId, editorState.editMemoId]);

  const editor = useEditor({
    extensions: [Bold, Document, Paragraph, Text, TaskList, TaskItem, BulletList, OrderedList, ListItem],
    content: props.content || "",
    editable: props.editable,
  });

  useEffect(() => {
    editor?.setOptions({ editable: props.editable });
  }, [props.editable]);

  const onOk = async () => {
    const content = editor?.getHTML();
    try {
      const { editMemoId } = editorStateService.getState();
      if (editMemoId && editMemoId !== UNKNOWN_ID) {
        const prevMemo = memoService.getMemoById(editMemoId ?? UNKNOWN_ID);

        if (prevMemo && prevMemo.content !== content) {
          await memoService.patchMemo({
            id: prevMemo.id,
            content,
          });
        }
        editorStateService.clearEditMemo();
        props.onCancel && props.onCancel();
      } else {
        if (content) await memoService.createMemo({ content });
        locationService.clearQuery();
      }
    } catch (error: any) {
      toastHelper.error(error.message);
    }
  };

  return (
    <div className={`prosemirror-editor ${props.cardMode && "no-hover"}`}>
      <div className="editor">
        <EditorContent editor={editor} />
      </div>
      {editor && props.editable ? (
        <>
          <div className="toolbar">
            <MenuBar editor={editor} />
            {props.cardMode && props.editable && (
              <button className="cancel" onClick={props.onCancel}>
                取消
              </button>
            )}
            <button className="write" onClick={onOk}>
              保存轻笔记
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ProseMirrorEditor;
