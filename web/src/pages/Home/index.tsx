import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useLoading from "@/hooks/useLoading";
import { userService } from "@/services";
import { useAppSelector } from "@/store";
import { Popup, Modal, Toast, Editor, Button, Input, Only } from "@/components";
import Sidebar from "./components/Sidebar";

import MemosHeader from "./components/MemosHeader";
import MemoFilter from "./components/MemoFilter";
import MemoList from "./components/MemoList";
import { validate, ValidatorConfig } from "@/helpers/validator";
import * as api from "@/helpers/api";
import "./index.less";

const validateConfig: ValidatorConfig = {
  notEmpty: true,
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

function Index() {
  const [email, setEmail] = useState("");
  const [visible, setVisible] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const [showLoginForm, setShowLoginForm] = useState(false);
  const user = useAppSelector((state) => state.user.user);
  const location = useAppSelector((state) => state.location);
  const loadingState = useLoading();

  const handleSigninBtnsClick = async () => {
    const emailValidResult = validate(email, { isEmail: true, ...validateConfig });
    if (!emailValidResult.result) {
      setEmailError(emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      setPasswordError(passwordValidResult.reason);
      return;
    }

    try {
      await api.signin(email, password);
      const user = await userService.doSignIn();
      if (user) {
        navigate("/");
        setShowLoginForm(false);
      } else {
        Toast.info("😟 Login failed");
      }
    } catch (error: any) {
      const data = error.response.data;
      if (data.message.match("User")) {
        setEmailError(data.message);
      }
      if (data.message.match("password")) {
        setPasswordError(data.message);
      }
    }
  };

  useEffect(() => {
    userService
      .initialState()
      .catch()
      .finally(async () => {
        const { host, owner, user } = userService.getState();
        if (!host) {
          return navigate(`/signin`);
        }
        if (userService.isVisitorMode()) {
          if (!owner) {
            Toast.info("User not found");
          }
        } else {
          if (!user) {
            // locationService.replaceHistory();
            navigate(`/u/${host.id}`);
          }
        }
        loadingState.setFinish();
      });
  }, []);

  return (
    <section className="page-wrapper">
      {loadingState.isLoading ? null : (
        <div className="page-container">
          <Popup
            visible={visible}
            position="left"
            onClose={() => {
              setVisible(false);
            }}
          >
            <Sidebar />
          </Popup>
          <main className="memos-wrapper">
            <MemosHeader onClick={() => setVisible(!visible)} />
            <Only when={!userService.isVisitorMode()}>
              <div className="editor">
              <Editor editable clearWhenSave />
              </div>
            
            </Only>
            <MemoFilter />
            <MemoList />
            <Only when={userService.isVisitorMode()}>
              <div className="addtion-btn-container">
                {user ? (
                  <Button size="L" onClick={() => (window.location.href = "/")}>
                    返回我的主页
                  </Button>
                ) : (
                  <Button size="L" onClick={() => setShowLoginForm(true)}>
                    欢迎使用有墨轻笔记, 点击注册/登录
                  </Button>
                )}
              </div>
            </Only>
          </main>
        </div>
      )}
      <Modal visible={showLoginForm} closeable onClose={() => setShowLoginForm(false)}>
        <div className="login-form">
          <Input
            fullWidth
            label="用户名"
            message={emailError}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const text = e.target.value as string;
              setEmail(text);
            }}
          />
          <Input
            fullWidth
            type="password"
            message={passwordError}
            label="密码"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const text = e.target.value as string;
              setPassword(text);
            }}
          />
          <Button fullWidth onClick={handleSigninBtnsClick}>
            登录
          </Button>
          {/*<a></a>*/}
          <span>版本内测中, 暂未开放注册</span>
        </div>
      </Modal>
    </section>
  );
}

export default Index;
