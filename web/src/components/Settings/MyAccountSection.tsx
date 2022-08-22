import { useState } from "react";
import { TextInput } from "@strapi/design-system/TextInput";
import { TextButton } from "@strapi/design-system/TextButton";
import { Button } from "@strapi/design-system/Button";
import Only from "../common/OnlyWhen";
import { useAppSelector } from "../../store";
import { userService } from "../../services";
import { validate, ValidatorConfig } from "../../helpers/validator";
import toastHelper from "../Toast";
import { showCommonDialog } from "../Dialog/CommonDialog";
import showChangePasswordDialog from "../ChangePasswordDialog";

import "../../less/settings/my-account-section.less";

const validateConfig: ValidatorConfig = {
  notEmpty: true,
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

interface Props {}

const MyAccountSection: React.FC<Props> = () => {
  const user = useAppSelector((state) => state.user.user as User);
  const [username, setUsername] = useState<string>(user.name);
  const openAPIRoute = `${window.location.origin}/api/memo?openId=${user.openId}`;

  const handleUsernameChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextUsername = e.target.value as string;
    setUsername(nextUsername);
  };

  const handleConfirmEditUsernameBtnClick = async () => {
    if (username === user.name) {
      return;
    }

    const usernameValidResult = validate(username, { ...validateConfig, noChinese: false });
    if (!usernameValidResult.result) {
      toastHelper.error("Username " + usernameValidResult.reason);
      return;
    }

    try {
      await userService.patchUser({
        id: user.id,
        name: username,
      });
      toastHelper.info("Username changed");
    } catch (error: any) {
      toastHelper.error(error.message);
    }
  };

  const handleChangePasswordBtnClick = () => {
    showChangePasswordDialog();
  };

  const handleResetOpenIdBtnClick = async () => {
    showCommonDialog({
      title: "Reset Open API",
      content: "❗️The existing API will be invalidated and a new one will be generated, are you sure you want to reset?",
      style: "warning",
    });
  };

  const handlePreventDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSignOutBtnClick = async () => {
    const { host, owner, user } = userService.getState();
    userService.doSignOut().catch(() => {
      // do nth
    });
    if (host) window.location.href = `/u/${host.id}`;
  };

  return (
    <>
      <div className="section-container account-section-container">
        <p className="title-text">Account Information</p>
        <label className="form-label">
          <span className="normal-text">Account:</span>
          <span className="normal-text">{user.email}</span>
        </label>
        <label className="form-label input-form-label username-label">
          <span className="normal-text">Username:</span>
          <TextInput aria-label="username" type="text" size="S" value={username} onChange={handleUsernameChanged} />
          <div className={`btns-container ${username === user.name ? "!hidden" : ""}`} onClick={handlePreventDefault}>
            <TextButton onClick={handleConfirmEditUsernameBtnClick}>Save</TextButton>
            <TextButton
              onClick={() => {
                setUsername(user.name);
              }}
            >
              Cancel
            </TextButton>
          </div>
        </label>
        <label className="form-label password-label">
          <span className="normal-text">Password:</span>
          <TextButton onClick={handleChangePasswordBtnClick}>Change it</TextButton>
        </label>
        <Only when={!userService.isVisitorMode()}>
          <Button variant="tertiary" onClick={handleSignOutBtnClick}>
            Sign out
          </Button>
        </Only>
      </div>
      <div className="section-container openapi-section-container">
        <p className="title-text">Your MEMO API</p>
        <p className="value-text">{openAPIRoute}</p>
        <Button variant="danger" onClick={handleResetOpenIdBtnClick}>
          Reset API
        </Button>
        <div className="usage-guide-container">
          <p className="title-text">I want to develop API tools by myself:</p>
          <pre>{`POST ${openAPIRoute}\nContent-type: application/json\n{\n  "content": "Hello #memos from ${window.location.origin}"\n}`}</pre>
        </div>
      </div>
    </>
  );
};

export default MyAccountSection;
