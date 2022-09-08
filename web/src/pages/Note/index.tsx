import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout, Memo } from "@/components";
import { memoService,userService } from "@/services";
import "./index.less";

const NotePage = () => {
  const { memoId } = useParams();
  const [memo, setMemo] = useState<any>(null);
  const [user,setUser] = useState<any>(null);
  useEffect(() => {
    memoService.getMemoById(Number(memoId)).then((data) => {
      setMemo(data);
      userService.getUserById(data.creatorId).then((user)=>{
        console.log(user)
        setUser(user);
      })
    });
  }, []);
  return (
    <PageLayout className="note-page">
      <div className="header">
        <img src="/images/logo.png" alt="" />
        <span>有墨轻记</span>
      </div>
      <div className="user">
        <span className="name">{user?.name}</span>
        <span className="days">这是我在有墨的第1153天</span>
      </div>
      {memo && <Memo memo={memo} />}
    </PageLayout>
  );
};

export default NotePage;
