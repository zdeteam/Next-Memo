import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import { userService } from "../../services";
import { useAppSelector } from "../../store";
import useLoading from "../../hooks/useLoading";
import Only from "../../components/OnlyWhen/OnlyWhen";
import Sidebar from "./components/Sidebar/Sidebar";
import MemosHeader from "./components/MemosHeader/MemosHeader";
import ProseMirrorEditor from "../../components/Editor/ProseMirrorEditor";
import MemoFilter from "./components/MemoFilter/MemoFilter";
import MemoList from "./components/MemoList/MemoList";
import toastHelper from "../../components/Toast/Toast";
import Modal from "../../components/Modal/Modal";
import "./index.less";
import { validate, ValidatorConfig } from "../../helpers/validator";
import * as api from "../../helpers/api";

const validateConfig: ValidatorConfig = {
  notEmpty: true,
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

function Index() {
  const [email, setEmail] = useState("");
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
        toastHelper.error("😟 Login failed");
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
            toastHelper.error("User not found");
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
    <section className="page-wrapper home">
      {loadingState.isLoading ? null : (
        <div className="page-container">
          <Sidebar />
          <main className="memos-wrapper">
            <div className="memos-editor-wrapper">
              <MemosHeader />
              <Only when={!userService.isVisitorMode()}>
                <ProseMirrorEditor editable clearWhenSave />
              </Only>
              <MemoFilter />
            </div>
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
