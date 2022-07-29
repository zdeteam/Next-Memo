import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import { validate, ValidatorConfig } from "../helpers/validator";
import useLoading from "../hooks/useLoading";
import { locationService, userService } from "../services";
import toastHelper from "../components/Toast";
import "../less/signin.less";

interface Props { }

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

const Signin: React.FC<Props> = () => {

  const pageLoadingState = useLoading(true);
  const [siteHost, setSiteHost] = useState<User>();
  const [status, setStatus] = useState<'signin' | 'invite' | 'signup'>('signin')
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const actionBtnLoadingState = useLoading(false);

  useEffect(() => {
    try {
      const verifiedEmail = window.atob(location.search.slice(1,)).split('p=')[1];
      if (verifiedEmail) {
        setVerifiedEmail(verifiedEmail);
        setStatus('signup');
      }
    } catch (error) {

    }
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
    const res = await api.invite(inviteEmail, location.origin + `/signin?${window.btoa('p=' + inviteEmail)}`);
    console.log(res)
    if (res)
      toastHelper.success('Email sent successfully')
    else
      toastHelper.error('User already exists')
  }

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
            <p className="title-text">
              Memos
            </p>
          </div>
          <p className="slogan-text">
            An <i>open source</i>, <i>self-hosted</i> knowledge base that works with a SQLite db file.
          </p>
        </div>
        <div className={`page-content-container ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}>
          {
            status === 'signin' && <>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input type="email" value={email} onChange={handleEmailInputChanged} />
              </div>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Password</span>
                <input type="password" value={password} onChange={handlePasswordInputChanged} />
              </div>
            </>
          }
          {
            status === 'invite' && <>
              <div className="form-item-container input-form-container">
                <span className={`normal-text not-null`}>Email</span>
                <input type="email" value={inviteEmail} onChange={handleVerifyEmailInputChanged} />
              </div>
            </>
          }
          {
            status === 'signup' && <>
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
          }
        </div>
        {status === 'signin' && <div className="action-btns-container">
          <span className='btn' onClick={() => setStatus('invite')}>
            Sign up
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
              onClick={() => handleSignUpBtnClick(email, password, 'HOST')}
            >
              Sign up as Host
            </button>
          )}
        </div>
        }
        {status === 'invite' &&
          <div className="action-btns-container">
            <span className='btn' onClick={() => setStatus('signin')}>
              Back
            </span>
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleInviteBtnClick()}
            >
              Verify Email
            </button>
          </div>
        }
        {status === 'signup' &&
          <div className="action-btns-container">
            <button
              className={`btn signin-btn ${actionBtnLoadingState.isLoading ? "requesting" : ""}`}
              onClick={() => handleSignUpBtnClick(verifiedEmail, signupPassword, 'USER')}
            >
              Start now
            </button>
          </div>
        }
        <p className={`tip-text ${siteHost || pageLoadingState.isLoading ? "" : "host-tip"}`}>
          {siteHost || pageLoadingState.isLoading
            ? null
            : "You are registering as the Site Host."}
        </p>
      </div>
    </div>
  );
};

export default Signin;
