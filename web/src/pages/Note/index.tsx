import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { PageLayout, Memo } from "@/components";
import { memoService, userService } from "@/services";
import "./index.less";

const NotePage = () => {
  const oneDay = 24 * 60 * 60 * 1000;
  const { memoId } = useParams();
  const [memo, setMemo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    memoService.getMemoById(Number(memoId)).then((data) => {
      setMemo(data);
      userService.getUserById(data.creatorId).then((user) => {
        console.log(user);
        setUser(user);
      });
    });
  }, []);
  return (
    <div className="note-page">
      <div className="top">
        <div className="user">
          <span className="name">{user?.name}</span>
          <span className="days">这是我在有墨的第 {Math.round(Math.abs((Date.now() - user?.createdTs) / oneDay))} 天</span>
        </div>
        <div className="header">
          <img src="/images/logo.png" alt="" />
        </div>
      </div>

      {memo && <Memo timeFormat="YYYY-MM-DD" memo={memo} />}
    </div>
  );
};

export default NotePage;
