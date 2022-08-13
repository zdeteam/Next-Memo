import "./style.less";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Document from '@tiptap/extension-document'
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Text from '@tiptap/extension-text'
import Paragraph from '@tiptap/extension-paragraph'
// import Document from "@tiptap/extension-document";

import React from "react";


const CustomDocument = Document.extend({
    content: 'taskList',
})

const CustomTaskItem = TaskItem.extend({
    content: 'inline*',
})

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive("bold") ? "is-active" : ""}>
        bold
      </button>
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive("bulletList") ? "is-active" : ""}>
        bullet list
      </button>

      <button
        style={{ border: "1px solid", margin: "4px" }}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive("orderedList") ? "is-active" : ""}
      >
        ordered list
      </button>

      <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={editor.isActive("taskList") ? "is-active" : ""}>
        toggleTaskList
      </button>
    </>
  );
};

// eslint-disable-next-line react/display-name
export default () => {
  const editor = useEditor({
    extensions: [ Paragraph,CustomDocument,Text,TaskList, CustomTaskItem],
    content: `
 <ul data-type="taskList">
        <li data-type="taskItem" data-checked="true">flour</li>
        <li data-type="taskItem" data-checked="true">baking powder</li>
        <li data-type="taskItem" data-checked="true">salt</li>
        <li data-type="taskItem" data-checked="false">sugar</li>
        <li data-type="taskItem" data-checked="false">milk</li>
        <li data-type="taskItem" data-checked="false">eggs</li>
        <li data-type="taskItem" data-checked="false">butter</li>
      </ul>
      
    `,
  });

  return (
    <div>
      <MenuBar editor={editor} />
      <div style={{ height: "12px" }}></div>
      <EditorContent editor={editor} />
    </div>
  );
};
