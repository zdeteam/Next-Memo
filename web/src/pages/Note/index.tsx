import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout, Memo } from "@/components";
import { memoService } from "@/services";
import "./index.less";

const NotePage = () => {
  const { memoId } = useParams();
  const [memo, setMemo] = useState<any>(null);
  useEffect(() => {
    memoService.getMemoById(Number(memoId)).then((data) => {
      setMemo(data);
    });
  }, []);
  return (
    <PageLayout className="note-page">
      <div className="header">
        <img src="/images/logo.png" alt="" />
        <span>有墨轻记</span>
      </div>
      {memo && <Memo key={`${memo.id}-${memo.updatedTs}`} memo={memo} />}
    </PageLayout>
  );
};

export default NotePage;
