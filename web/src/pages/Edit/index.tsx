import React, { useEffect, useState } from "react";
import { Editor, PageLayout } from "@/components";
import { useParams } from "react-router-dom";
import { memoService, editorStateService } from "@/services";
import { UNKNOWN_ID } from "@/helpers/consts";

import "./index.less";
import { useNavigate } from "react-router-dom";

const EditPage = () => {
  const navigate = useNavigate();
  const { memoId } = useParams();
  const [memo, setMemo] = useState<any>(null);
  useEffect(() => {
    editorStateService.setEditMemoWithId(Number(memoId));
    memoService.getMemoById(Number(memoId)).then((data) => {
      setMemo(data);
    });
  }, []);
  
  const goBack = () => {
    editorStateService.setEditMemoWithId(UNKNOWN_ID);
    navigate("/");
  };

  return (
    <PageLayout title="编辑中" onClickLeft={goBack} className="edit-page">
      {memo && <Editor editable onSave={goBack} toolbarPosition="top" content={memo.content} />}
    </PageLayout>
  );
};

export default EditPage;
