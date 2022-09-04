import React, { useEffect } from "react";
import { Editor, PageLayout } from "@/components";

import "./index.less";
import { useNavigate } from "react-router-dom";

const EditPage = () => {
  const navigate = useNavigate();
//   useEffect(() => {
//     window.onresize = function () {
//       const newh = window.localStorage.getItem("curwinh");
//       document.getElementById("app").style.height = newh + "px";
//     };
//   }, []);
  return (
    <PageLayout title="编辑中" onClickLeft={() => navigate("/")} className="edit-page">
      <Editor editable clearWhenSave toolbarPosition="top" />
    </PageLayout>
  );
};

export default EditPage;
