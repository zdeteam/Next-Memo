import React, { SetStateAction, useEffect, useState } from "react";
import { Button } from "@strapi/design-system/Button";
import { TextInput } from "@strapi/design-system/TextInput";
import { TextButton } from "@strapi/design-system/TextButton";
import ArrowLeft from "@strapi/icons/ArrowLeft";
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
  const [resetPasswordError, setResetPasswordError] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState("");

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
  };

  const handleInviteBtnClick = async () => {
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
    if (res)
      toastHelper.success("Check your email for a link to start. If it doesn’t appear within a few minutes, check your spam folder.");
    else toastHelper.error("User already exists");
  };

  const handleResetPasswordBtnClick = async () => {
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
    if (res)
      toastHelper.success(
        "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder."
      );
    else toastHelper.error("User is not exists");
  };

  const handleSignUpBtnClick = async (email: string, password: string, role: UserRole) => {
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
  };

  return (
    <div className="page-wrapper signin">
      <div className="page-container">
        <div className="page-header-container">
          <div className="title-container">
            <p className="title-text">OpenFlomo</p>
          </div>
          <p className="slogan-text">
            An <i>open source</i> Flomo, help you quickly record ideas.
          </p>
        </div>
        <div className={`page-content-container`}>
          {status === "signin" && (
            <>
              <TextInput label="Email" name="email" value={email} onChange={handleEmailInputChanged} />
              <TextInput type="password" label="Password" name="password" value={password} onChange={handlePasswordInputChanged} />
            </>
          )}
          {status === "invite" && (
            <>
              <TextInput label="Email" name="email" value={inviteEmail} onChange={handleVerifyEmailInputChanged} />
            </>
          )}
          {status === "forgot" && (
            <>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="form-text">Enter your user account's verified email address and we will send you a password reset link.</p>
              <TextInput
                label="Email"
                name="email"
                value={resetPasswordEmail}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setResetPasswordEmail(e.target.value)}
              />
            </>
          )}
          {status === "signup" && (
            <>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="form-text">You're almost done!</p>
              <TextInput label="Email" name="email" value={verifiedEmail} onChange={handleVerifyEmailInputChanged} />
              <TextInput
                type="password"
                label="Password"
                name="password"
                value={signupPassword}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setSignupPassword(e.target.value)}
              />
              <TextInput
                type="password"
                label="Confirm Password"
                name="password"
                value={signupConfirmPassword}
                onChange={(e: { target: { value: SetStateAction<string> } }) => setSignupConfirmPassword(e.target.value)}
              />
            </>
          )}
        </div>
        {status === "signin" && (
          <div className="action-btn-container">
            <TextButton onClick={() => setStatus("forgot")}>Forgot password?</TextButton>
            {siteHost || pageLoadingState.isLoading ? (
              <Button fullWidth size="L" onClick={handleSigninBtnsClick}>
                Sign in
              </Button>
            ) : (
              <Button
                fullWidth
                size="L"
                disabled={email === "" || password === ""}
                onClick={() => handleSignUpBtnClick(email, password, "HOST")}
              >
                Sign up as Host
              </Button>
            )}
            <Button size="L" variant="ghost" fullWidth onClick={() => setStatus("invite")}>
              New to OpenFlomo? Create an account
            </Button>
          </div>
        )}
        {status === "invite" && (
          <div className="action-btn-container">
            <Button fullWidth size="L" disabled={inviteEmail === ""} onClick={handleInviteBtnClick}>
              Send verify Email
            </Button>
            <TextButton startIcon={<ArrowLeft />} onClick={() => setStatus("signin")}>
              Back to Sign in
            </TextButton>
          </div>
        )}
        {status === "forgot" && (
          <div className="action-btn-container">
            <Button fullWidth size="L" disabled={resetPasswordEmail === ""} onClick={handleResetPasswordBtnClick}>
              Send password reset email
            </Button>
            <TextButton startIcon={<ArrowLeft />} onClick={() => setStatus("signin")}>
              Back to Sign in
            </TextButton>
          </div>
        )}
        {status === "signup" && (
          <div className="action-btn-container">
            <Button fullWidth size="L" onClick={() => handleSignUpBtnClick(verifiedEmail, signupPassword, "USER")}>
              Start now
            </Button>
          </div>
        )}
        {status === "reset" && (
          <div className="action-btn-container">
            {resetPasswordError}
            <div className="text-container">
              <p>A new password has been sent to your email.</p>
              <p>If it doesn’t appear within a few minutes, check your spam folder.</p>
            </div>
            <TextButton startIcon={<ArrowLeft />} onClick={() => setStatus("signin")}>
              Back to Sign in
            </TextButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signin;
