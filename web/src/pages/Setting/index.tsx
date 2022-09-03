import React from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services";
import { NavBar, Button } from "@/components";
import "./index.less";

const SettingPage = () => {
  const navigation = useNavigate();
  const handleSignOutBtnClick = async () => {
    const { host, owner, user } = userService.getState();
    userService.doSignOut().catch(() => {
      // do nth
    });
    if (host) window.location.href = `/u/${host.id}`;
  };

  return (
    <div className="setting-page">
      <NavBar title="设置" leftText="返回" onClickLeft={() => navigation("/")} />
      <div className="body">
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
        <div className="buttons">
          <span>服务条款</span>
          <span>隐私协议</span>
        </div>
        <Button round block type='primary'
          onClick={handleSignOutBtnClick}
        >退出登录</Button>
      </div>
    </div>
  );
};

export default SettingPage;
