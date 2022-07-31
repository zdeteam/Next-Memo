import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import { locationService, userService } from "../services";
import toastHelper from "../components/Toast";
import "../less/signin.less";

interface Props {}

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const Signin: React.FC<Props> = () => {
  const pageLoadingState = useLoading(true);
  const [siteHost, setSiteHost] = useState<User>();
  const [status, setStatus] = useState<"signin" | "invite" | "signup" | "forgot" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [resetPasswordError, setResetPasswordError] = useState<string>('');
  const [signupPassword, setSignupPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    try {
      const { action, email } = JSON.parse(window.atob(location.search.slice(1)).split("p=")[1]);
      console.log(action);
      if (action === "invite") {
        setVerifiedEmail(email);
        setStatus("signup");
      }
      if (action === "forgot") {
        setResetPasswordEmail(email);
        setStatus("reset");
        api
          .changePassword(email)
          .then((data) => {
            console.log("data", data);
            // setResetPasswordStatus(data);
            setResetPasswordError("A new password has been sent to your email.");
          })
          .catch((error) => {
            setResetPasswordError(error.response.data.message);
          });
      }
    } catch (error: any) {
      console.log(error);
    }
    api.getSystemStatus().then(({ data }) => {
      const { data: status } = data;
      setSiteHost(status.host);
      if (status.profile?.mode === "dev") {
        setEmail("admin@memoz.today");
        setPassword("123456");
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

  const handleVerifyEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setInviteEmail(text);
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
        toastHelper.error("😟 Login failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error("😟 " + error.message);
    }
    actionBtnLoadingState.setFinish();
  };

  const handleInviteBtnClick = async () => {
    actionBtnLoadingState.setLoading();
    const res = await api.invite(
      inviteEmail,
      location.origin +
        `/signin?${window.btoa(
          "p=" +
            JSON.stringify({
              action: status,
              email: inviteEmail,
            })
        )}`
    );
    actionBtnLoadingState.setFinish();
    if (res)
      toastHelper.success("Check your email for a link to start. If it doesn’t appear within a few minutes, check your spam folder.");
    else toastHelper.error("User already exists");
  };

  const handleResetPasswordBtnClick = async () => {
    actionBtnLoadingState.setLoading();
    const res = await api.resetPassword(
      resetPasswordEmail,
      location.origin +
        `/signin?${window.btoa(
          "p=" +
            JSON.stringify({
              action: status,
              email: resetPasswordEmail,
            })
        )}`
    );
    actionBtnLoadingState.setFinish();
    if (res)
      toastHelper.success(
        "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder."
      );
    else toastHelper.error("User is not exists");
  };

  const handleSignUpBtnClick = async (email: string, password: string, role: UserRole) => {
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
      await api.signup(email, password, role);
      const user = await userService.doSignIn();
      if (user) {
        locationService.replaceHistory("/");
      } else {
        toastHelper.error("😟 Signup failed");
      }
    } catch (error: any) {
      console.error(error);
      toastHelper.error("😟 " + error.message);
    }
    actionBtnLoadingState.setFinish();
  };

  return (
    <div className="page-wrapper signin">
      <div className="page-container">
        <div className="page-header-container">
          <div className="title-container">
            <p className="title-text">Memoz</p>
          </div>
          <p className="slogan-text">
            An <i>open source</i>, <i>self-hosted</i> knowledge base that works with a SQLite db file.
          </p>
        </div>
        <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
          {status === "signin" && (
            <>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input type="email" value={email} onChange={handleEmailInputChanged} />
              </div>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Password</span>
                <input type="password" value={password} onChange={handlePasswordInputChanged} />
              </div>
            </>
          )}
          {status === "invite" && (
            <>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input type="email" value={inviteEmail} onChange={handleVerifyEmailInputChanged} />
              </div>
            </>
          )}
          {status === "forgot" && (
            <>
              <span>Enter your user account's verified email address and we will send you a password reset link.</span>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input type="email" value={resetPasswordEmail} onChange={(e) => setResetPasswordEmail(e.target.value)} />
              </div>
            </>
          )}
          {status === "signup" && (
            <>
              <p>You're almost done!</p>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input disabled type="email" value={verifiedEmail} onChange={handleVerifyEmailInputChanged} />
              </div>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Password</span>
                <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} />
              </div>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Confirm Password</span>
                <input type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} />
              </div>
            </>
          )}
        </div>
        {status === "signin" && (
          <div className="action-btns-container">
            <a className="btn" onClick={() => setStatus("forgot")}>
              Forgot password?
            </a>
            <span className="btn" onClick={() => setStatus("invite")}>
              New to Memoz? Create an account
            </span>
            {siteHost || pageLoadingState.isLoading ? (
              <button
                className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
                onClick={() => handleSigninBtnsClick()}
              >
                Sign in
              </button>
            ) : (
              <button
                className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
                onClick={() => handleSignUpBtnClick(email, password, "HOST")}
              >
                Sign up as Host
              </button>
            )}
          </div>
        )}
        {status === "invite" && (
          <div className="action-btns-container">
            <span className="btn" onClick={() => setStatus("signin")}>
              Back
            </span>
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleInviteBtnClick()}
            >
              Verify Email
            </button>
          </div>
        )}
        {status === "forgot" && (
          <div className="action-btns-container">
            <span className="btn" onClick={() => setStatus("signin")}>
              Back
            </span>
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleResetPasswordBtnClick()}
            >
              Send password reset email
            </button>
          </div>
        )}
        {status === "signup" && (
          <div className="action-btns-container">
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleSignUpBtnClick(verifiedEmail, signupPassword, "USER")}
            >
              Start now
            </button>
          </div>
        )}
        {status === "reset" && (
          <div>
            {resetPasswordError}
            <p>If it doesn’t appear within a few minutes, check your spam folder.</p>
            <span className="btn" onClick={() => setStatus("signin")}>
              Back to sign in
            </span>
          </div>
        )}
        <p className={`tip-text ${siteHost || pageLoadingState.isLoading ? "" : "host-tip"}`}>
          {siteHost || pageLoadingState.isLoading ? null : "You are registering as the Site Host."}
        </p>
      </div>
    </div>
  );
};

export default Signin;
