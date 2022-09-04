import { useEffect, useState } from "react";
import * as api from "@/helpers/api";

import { validate, ValidatorConfig } from "@/helpers/validator";
import useI18n from "@/hooks/useI18n";
import useLoading from "@/hooks/useLoading";
import { globalService, locationService, userService } from "@/services";
import { Toast, Input, Button } from "@/components";

import "./index.less";
import { useNavigate } from "react-router-dom";

interface Props { }

const validateConfig: ValidatorConfig = {
  notEmpty: true,
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const SignIn: React.FC<Props> = () => {
  const { t, locale } = useI18n();
  const navigate = useNavigate()
  const pageLoadingState = useLoading(true);
  const [siteHost, setSiteHost] = useState<User>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    api.getSystemStatus().then(({ data }) => {
      const { data: status } = data;
      setSiteHost(status.host);
      if (status.profile.mode === "dev") {
        setEmail("demo@usememos.com");
        setPassword("secret");
      }
      pageLoadingState.setFinish();
    });
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
  };

  const handleSigninBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      Toast.info("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      Toast.info("Password: " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signin(email, password);
      const user = await userService.doSignIn();
      if (user) {
        // locationService.replaceHistory("/");
        navigate("/")
      } else {
        Toast.info("Login failed");
      }
    } catch (error: any) {
      console.error(error);
      Toast.info(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignUpAsHostBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      Toast.info("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      Toast.info("Password: " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(email, password, "HOST");
      const user = await userService.doSignIn();
      if (user) {
        locationService.replaceHistory("/");
      } else {
        Toast.info("Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      Toast.info(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleLocaleItemClick = (locale: Locale) => {
    globalService.setLocale(locale);
  };

  return (
    <div className="signin-page">

      <div className="header">
        <img src="/images/logo.png" />
        <span>轻笔记 慢生活</span>
      </div>
      <div className="form">
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
      </div>
      <Button loading={actionBtnLoadingState.isLoading} round block type='primary' onClick={handleSigninBtnsClick}>
        登录
      </Button>
    </div>
  );
};

export default SignIn;
{/* <div className="page-container">
<div className="auth-form-wrapper">
  <div className="page-header-container">
    <div className="title-container">
      <p className="title-text">
        <span className="icon-text">✍️</span> Memos
      </p>
    </div>
    <p className="slogan-text">{t("slogan")}</p>
  </div>
  <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
    <div className="form-item-container input-form-container">
      <span className={`normal-text ${email ? "not-null" : ""}`}>{t("common.email")}</span>
      <input type="email" value={email} onChange={handleEmailInputChanged} />
    </div>
    <div className="form-item-container input-form-container">
      <span className={`normal-text ${password ? "not-null" : ""}`}>{t("common.password")}</span>
      <input type="password" value={password} onChange={handlePasswordInputChanged} />
    </div>
  </div>
  <div className="action-btns-container">
    {siteHost || pageLoadingState.isLoading ? (
      <button
        className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
        onClick={() => handleSigninBtnsClick()}
      >
        {t("common.sign-in")}
      </button>
    ) : (
      <button
        className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
        onClick={() => handleSignUpAsHostBtnsClick()}
      >
        {t("auth.signup-as-host")}
      </button>
    )}
  </div>
  <p className={`tip-text ${siteHost || pageLoadingState.isLoading ? "" : "host-tip"}`}>
    {siteHost || pageLoadingState.isLoading ? t("auth.not-host-tip") : t("auth.host-tip")}
  </p>
</div>
<div className="footer-container">
  <div className="language-container">
    <span className={`locale-item ${locale === "en" ? "active" : ""}`} onClick={() => handleLocaleItemClick("en")}>
      English
    </span>
    <span className="split-line">/</span>
    <span className={`locale-item ${locale === "zh" ? "active" : ""}`} onClick={() => handleLocaleItemClick("zh")}>
      中文
    </span>
  </div>
</div>
</div> */}