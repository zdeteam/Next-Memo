import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import useI18n from "../hooks/useI18n";
import useLoading from "../hooks/useLoading";
import { globalService, locationService, userService } from "../services";
import toastHelper from "../components/Toast";
import GitHubBadge from "../components/GitHubBadge";
import "../less/auth.less";

interface Props {}

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const Auth: React.FC<Props> = () => {
  const { t, locale } = useI18n();
  const pageLoadingState = useLoading(true);
  const [siteHost, setSiteHost] = useState<User>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      toastHelper.error("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("Password: " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signin(email, password);
      const user = await userService.doSignIn();
      if (user) {
        locationService.replaceHistory("/");
      } else {
        toastHelper.error("Login failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleSignUpAsHostBtnsClick = async () => {
    if (actionBtnLoadingState.isLoading) {
      return;
    }

    const emailValidResult = validate(email, validateConfig);
    if (!emailValidResult.result) {
      toastHelper.error("Email: " + emailValidResult.reason);
      return;
    }

    const passwordValidResult = validate(password, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("Password: " + passwordValidResult.reason);
      return;
    }

    try {
      actionBtnLoadingState.setLoading();
      await api.signup(email, password, "HOST");
      const user = await userService.doSignIn();
      if (user) {
        locationService.replaceHistory("/");
      } else {
        toastHelper.error("Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error(error.response.data.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleLocaleItemClick = (locale: Locale) => {
    globalService.setLocale(locale);
  };

  return (
    <div className="page-wrapper auth">
      <div className="page-container">
        <div className="auth-form-wrapper">
          <div className="page-header-container">
            <div className="title-container">
              <p className="title-text">
                <span className="icon-text">✍️</span> Memos
              </p>
              <GitHubBadge />
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
      </div>
    </div>
  );
};

export default Auth;
