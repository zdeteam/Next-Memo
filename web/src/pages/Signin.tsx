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
  notEmpty: true,
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
  const [emailError, setEmailError] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteEmailError, setInviteEmailError] = useState("");
  const [inviteEmailInfo, setInviteEmailInfo] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordError, setSignupPasswordError] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupConfirmPasswordError, setSignupConfirmPasswordError] = useState("");

  const [resetPasswordEmail, setResetPasswordEmail] = useState("");
  const [resetPasswordEmailError, setResetPasswordEmailError] = useState("");
  const [resetPasswordEmailInfo, setResetPasswordEmailInfo] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const [resetPasswordSuccess, setResetPasswordSuccess] = useState<boolean>(false);
  const [resetPasswordError, setResetPasswordError] = useState<string>("");

  useEffect(() => {
    clear();
  }, [status]);

  const clear = () => {
    setEmail("");
    setEmailError("");
    setPassword("");
    setPasswordError("");
    setInviteEmail("");
    setInviteEmailError("");
    setInviteEmailInfo("");
    setSignupPasswordError("");
    setResetPasswordEmail("");
    setSignupPassword("");
    setSignupConfirmPassword("");
    setVerifiedEmail("");
    setSignupConfirmPasswordError("");
    setResetPasswordEmailError("");
    setResetPasswordEmailInfo("");
    setResetPasswordSuccess(false);
    setResetPasswordError("");
  };

  useEffect(() => {
    try {
      const { action, email } = JSON.parse(window.atob(location.search.slice(1)).split("p=")[1]);
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
            // setResetPasswordStatus(data);
            setResetPasswordSuccess(true);
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
        setEmail("admin@openflomo.today");
        setPassword("123456");
      }
      pageLoadingState.setFinish();
    });
  }, []);

  const handleEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setEmail(text);
    setEmailError("");
  };

  const handlePasswordInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setPassword(text);
    setPasswordError("");
  };

  const handleVerifyEmailInputChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setInviteEmail(text);
    setInviteEmailError("");
  };

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
        locationService.replaceHistory("/");
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

  const handleInviteBtnClick = async () => {
    setInviteLoading(true);
    const validResult = validate(inviteEmail, { isEmail: true, ...validateConfig });
    if (!validResult.result) {
      setInviteEmailError(validResult.reason);
      return setInviteLoading(false);
    }
    const res = await api
      .invite(
        inviteEmail,
        location.origin +
          `/signin?${window.btoa(
            "p=" +
              JSON.stringify({
                action: status,
                email: inviteEmail,
              })
          )}`
      )
      .catch((error) => {
        const data = error.response.data;
        setInviteEmailError(data.message);
      });
    if (res) {
      setInviteEmailInfo("Check your email for a link to start. If it doesn’t appear within a few minutes, check your spam folder.");
    } else {
      setInviteEmailError("User already exists");
    }
    setInviteLoading(false);
  };

  const handleResetPasswordBtnClick = async () => {
    setResetLoading(true);
    const validResult = validate(resetPasswordEmail, { isEmail: true, ...validateConfig });
    if (!validResult.result) {
      setResetPasswordEmailError(validResult.reason);
      return setResetLoading(false);
    }
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
      setResetPasswordEmailInfo(
        "Check your email for a link to reset your password. If it doesn’t appear within a few minutes, check your spam folder."
      );
    else setResetPasswordEmailError("User is not exists");
    setResetLoading(false);
  };

  const handleSignUpBtnClick = async (email: string, password: string, role: UserRole ) => {
    if (siteHost !== null) {
      const signupPasswordValidResult = validate(signupPassword, validateConfig);
      if (!signupPasswordValidResult.result) {
        setSignupPasswordError(signupPasswordValidResult.reason);
        return;
      }

      const signupConfirmPasswordValidResult = validate(signupConfirmPassword, validateConfig);
      if (!signupConfirmPasswordValidResult.result) {
        setSignupConfirmPasswordError(signupConfirmPasswordValidResult.reason);
        return;
      }
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
              <TextInput error={emailError} label="Email" name="email" value={email} onChange={handleEmailInputChanged} />
              <TextInput
                error={passwordError}
                type="password"
                label="Password"
                name="password"
                value={password}
                onChange={handlePasswordInputChanged}
              />
            </>
          )}
          {status === "invite" && (
            <>
              <TextInput
                error={inviteEmailError}
                hint={inviteEmailInfo}
                label="Email"
                name="email"
                value={inviteEmail}
                onChange={handleVerifyEmailInputChanged}
              />
            </>
          )}
          {status === "forgot" && (
            <>
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <p className="form-text">Enter your user account's verified email address and we will send you a password reset link.</p>
              <TextInput
                error={resetPasswordEmailError}
                hint={resetPasswordEmailInfo}
                label="Email"
                name="email"
                value={resetPasswordEmail}
                onChange={(e: { target: { value: SetStateAction<string> } }) => {
                  setResetPasswordEmailError("");
                  setResetPasswordEmailInfo("");
                  setResetPasswordEmail(e.target.value);
                }}
              />
            </>
          )}
          {status === "signup" && (
            <>
              <p className="form-text">
                Hello, <span style={{ fontWeight: "bold" }}>{verifiedEmail}</span> .
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                You're almost done!
              </p>
              <TextInput
                error={signupPasswordError}
                type="password"
                label="Password"
                name="password"
                value={signupPassword}
                onChange={(e: { target: { value: SetStateAction<string> } }) => {
                  setSignupPasswordError("");
                  setSignupPassword(e.target.value);
                }}
              />
              <TextInput
                error={signupConfirmPasswordError}
                type="password"
                label="Confirm Password"
                name="password"
                value={signupConfirmPassword}
                onChange={(e: { target: { value: SetStateAction<string> } }) => {
                  setSignupConfirmPasswordError("");
                  setSignupConfirmPassword(e.target.value);
                }}
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
            <Button loading={inviteLoading} fullWidth size="L" onClick={handleInviteBtnClick}>
              Send verify Email
            </Button>
            <TextButton startIcon={<ArrowLeft />} onClick={() => setStatus("signin")}>
              Back to Sign in
            </TextButton>
          </div>
        )}
        {status === "forgot" && (
          <div className="action-btn-container">
            <Button loading={resetLoading} fullWidth size="L" onClick={handleResetPasswordBtnClick}>
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
          <div>
            <div className="text-container">
              {resetPasswordSuccess && (
                <>
                  <p style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px" }}>Your password reset completed</p>
                  <p style={{ fontWeight: "200", fontSize: "12px" }}>A new password has been sent to your email.</p>
                  <span style={{ fontWeight: "200", fontSize: "12px" }}>
                    If it doesn’t appear within a few minutes, check your spam folder.
                  </span>
                </>
              )}
              {resetPasswordError && <p>{resetPasswordError}</p>}
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
