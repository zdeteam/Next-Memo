import React, { useEffect, useRef, useState } from "react";
import { GoBold, GoListOrdered, GoListUnordered, GoUnfold, GoFold, GoTasklist } from "react-icons/go";
import { MdOutlineUnfoldMore, MdOutlineUnfoldLess } from "react-icons/md";
import { EditorContent, ReactRenderer, useEditor } from "@tiptap/react";
import classNames from 'classnames';
import Document from "@tiptap/extension-document";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import Placeholder from "@tiptap/extension-placeholder";
import OrderedList from "@tiptap/extension-ordered-list";
import Bold from "@tiptap/extension-bold";
import { Mention } from "./extension-hashtag";
import Text from "@tiptap/extension-text";
import Paragraph from "@tiptap/extension-paragraph";
import tippy from "tippy.js";
import { editorStateService, locationService, memoService } from "../../services";
import { UNKNOWN_ID } from "../../helpers/consts";
import { Toast, Button } from "@/components";
import { useAppSelector } from "../../store";
// import Button from "@/Button";
import MentionList from "./MentionList";
import "./index.less";

interface ProseMirrorEditorProps {
  content?: string;
  editable: boolean;
  foldable?: boolean;
  onCancel?: () => void;
  onClick?: () => void;
  onSave?: () => void;
  clearWhenSave?: boolean;
  toolbarPosition?: "top" | "bottom";
}
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-toolbar">
      <div onClick={() => editor.chain().focus().toggleBold().run()}>
        <GoBold />
      </div>
      <div onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <GoListOrdered />
      </div>
      <div onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <GoListUnordered />
      </div>
      <div onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <GoTasklist />
      </div>
    </div>
  );
};

const Editor = function (
  props: ProseMirrorEditorProps = {
    editable: true,
    toolbarPosition: "bottom",
  }
) {
  const MAX_MEMO_CONTAINER_HEIGHT = 160;
  const editorState = useAppSelector((state) => state.editor);
  const query = useAppSelector((state) => state.location.query);
  const { memos, tags } = useAppSelector((state) => state.memo);
  const editorRef = useRef<any>(null);
  const [showFoldBtn, setShowFoldBtn] = useState(false);
  const [isFold, setIsFold] = useState(false);
  const [prevContent, setPrevContent] = useState<any>("");
  const prevGlobalStateRef = useRef(editorState);
  const { tag: tagQuery, duration, type: memoType, text: textQuery, shortcutId } = query;

  useEffect(() => {
    // if (editorState.markMemoId && editorState.markMemoId !== UNKNOWN_ID && !props.cardMode) {
    //   const editorCurrentValue = editorRef.current?.getContent();
    //   const memoLinkText = `${editorCurrentValue ? "\n" : ""}Mark: @[MEMO](${editorState.markMemoId})`;
    //   editor?.commands.setContent(memoLinkText);
    //   editorStateService.clearMarkMemo();
    // }
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
    // prevGlobalStateRef.current = editorState;
  }, [editorState.markMemoId, editorState.editMemoId]);

  const suggestion = {
    render: () => {
      let component: any;
      let popup: any;

      return {
        onStart: (props: any) => {
          component = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }
          popup = tippy("body", {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate(props: any) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props: any) {
          console.log(props);
          if (props.event.key === "Escape") {
            popup[0].hide();
            return true;
          }
          return component.ref?.onKeyDown(props, props.view.state.mention$.query);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  };

  const editor = useEditor({
    extensions: [
      Bold,
      Document,
      Paragraph,
      Text,
      TaskList,
      TaskItem,
      BulletList,
      OrderedList,
      ListItem,
      Placeholder,
      Mention.configure({
        HTMLAttributes: {
          class: "umo-tag",
        },
        suggestion,
      }),
    ],
    content: props.content || "",
    editable: props.editable,
  });

  editor?.on("create", () => {
    if (Number(editorRef.current?.clientHeight) > MAX_MEMO_CONTAINER_HEIGHT) {
      setShowFoldBtn(true);
    }
  });

  editor?.on("update", () => {
    if (Number(editorRef.current?.clientHeight) > MAX_MEMO_CONTAINER_HEIGHT) {
      setShowFoldBtn(true);
    }
  });

  useEffect(() => {
    if (props.editable) setPrevContent(editor?.getHTML());
    editor?.setOptions({ editable: props.editable });
    if (props?.editable) setIsFold(false);
  }, [props.editable]);

  // useEffect(() => {
  //   if (!props.cardMode) {
  //     if (editor && !editor.isDestroyed) {
  //       if (prevContent) editor?.commands.setContent(prevContent);
  //       // setPrevContent("");
  //       const isEmpty = editor?.isEmpty;
  //       const content = editor?.getHTML();
  //       // editor?.commands.setContent(prevContent);
  //       if (tagQuery) {
  //         setPrevContent(content);
  //         // editor?.commands.setContent(prevContent);
  //         const string = ` <span data-type="hashtag" class="umo-tag" data-id="${tagQuery}" contenteditable="false">#${tagQuery}</span> `;
  //         editor?.commands.insertContent(string);
  //         // setPrevContent('')
  //       } else {
  //         // editor?.commands.clearContent();
  //         editor?.commands.setContent(prevContent);
  //       }
  //     }
  //   }
  // }, [editor,tagQuery]);

  const onOk = async () => {
    const content = editor?.getHTML();
    console.log(11122); 
    try {
      const { editMemoId } = editorStateService.getState();
      if (editMemoId && editMemoId !== UNKNOWN_ID) {
        await memoService.patchMemo({
          id: editMemoId,
          content,
        });
        editorStateService.clearEditMemo();
        // props.onCancel && props.onCancel();
        console.log(111);
        props.onSave && props.onSave();
        Toast.info("保存成功");
      } else {
        console.log(111123);
        if (content) {
          await memoService.createMemo({ content });
          Toast.info("保存成功");
        }
        locationService.clearQuery();
      }
      if (props.clearWhenSave) editor?.commands.clearContent();
    } catch (error: any) {
      Toast.info(error.message);
    }
  };
  const handleExpandBtnClick = () => {
    setIsFold(!isFold);
  };
  return (
    <div
      onClick={props.onClick}
      className={classNames("prosemirror-editor", { "toolbar-on-top": props.toolbarPosition === "top" })}
    >
      <div className={classNames("editor", { fold: isFold && showFoldBtn })} ref={editorRef}>
        <EditorContent editor={editor} />
      </div>
      {editor && props.editable ? (
        <>
          <div className="toolbar">
            <MenuBar editor={editor} />
           
            <Button type="primary" round disabled={editor?.isEmpty} className="write" size="small" onClick={onOk}>
              保存轻笔记
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Editor;
