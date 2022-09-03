import React from "react";
import { useNavigate } from "react-router-dom";
import { NavBar ,Button} from "@/components";
import "./index.less";

const SettingPage = () => {
  const navigation = useNavigate();
  return (
    <div className="setting-page">
      <NavBar title="设置" leftText="返回" onClickLeft={() => navigation("/")} />
      <div className="user-info">
        <div className="userEditBox">
          <div>
            <p>Aha！！</p>
          </div>
          <div className="btnBox">
            <div>修改昵称</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingPage;
