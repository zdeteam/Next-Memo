import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import { Memo } from "@/components";
import { memoService, userService } from "@/services";
import "./index.less";

const NotePage = () => {
  const { memoId } = useParams();
  const [memo, setMemo] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    memoService.getMemoById(Number(memoId)).then((data) => {
      setMemo(data);
      console.log(data,'data')
      userService.getUserById(data.creatorId).then((user) => {
        setUser(user);
      });
    });
  }, []);
  return (
    <div className="note-page">
      <div className="top">
        <div className="user">
          <span className="name">{user?.name}</span>
          <span className="days">这是我在有墨的第 {dayjs().diff(user?.createdTs, "day")} 天</span>
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
