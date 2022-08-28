import { useState } from "react";
// import { Button } from "@strapi/design-system/Button";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import Only from "../../../../components/OnlyWhen";
import useI18n from "../../../../hooks/useI18n";
import { useAppSelector } from "../../../../store";
import { userService } from "../../../../services";
import { validate, ValidatorConfig } from "../../../../helpers/validator";
import { showCommonDialog } from "../../../../components/Dialog/CommonDialog";
import { Toast } from "@/components";
import showChangePasswordDialog from "../ChangePasswordDialog";

import "./my-account-section.less";

const validateConfig: ValidatorConfig = {
  notEmpty: true,
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

interface Props {}

const MyAccountSection: React.FC<Props> = () => {
  const { t } = useI18n();
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
      Toast.info("Username " + usernameValidResult.reason);
      return;
    }

    try {
      await userService.patchUser({
        id: user.id,
        name: username,
      });
      Toast.info("Username changed");
    } catch (error: any) {
      console.error(error);
      Toast.info(error.response.data.message);
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
        <p className="title-text">{t("setting.account-section.title")}</p>
        <label className="form-label">
          <span className="normal-text">{t("common.email")}:</span>
          <span className="normal-text">{user.email}</span>
          <Button type="text" onClick={handleSignOutBtnClick}>
            Sign out
          </Button>
        </label>
        <label className="form-label input-form-label username-label">
          <span className="normal-text">{t("common.username")}:</span>
          <Input type="text" value={username} onChange={handleUsernameChanged} />
          <div className={`btns-container ${username === user.name ? "!hidden" : ""}`} onClick={handlePreventDefault}>
            <Button type="text" onClick={handleConfirmEditUsernameBtnClick}>
              {t("common.save")}
            </Button>
            <Button
              type="text"
              onClick={() => {
                setUsername(user.name);
              }}
            >
              {t("common.cancel")}
            </Button>
          </div>
        </label>
        <label className="form-label password-label">
          <span className="normal-text">{t("common.password")}:</span>
          <Button type="text" onClick={handleChangePasswordBtnClick}>
            {t("common.change")}
          </Button>
        </label>
      </div>
      <div className="section-container openapi-section-container">
        <p className="title-text">Open API</p>
        <p className="value-text">{openAPIRoute}</p>
        <Button type="danger" className="reset-btn" onClick={handleResetOpenIdBtnClick}>
          {t("common.reset")} API
        </Button>
        <div className="usage-guide-container">
          <p className="title-text">I want to develop API tools by myself:</p>
          <pre className="value-text">{`POST ${openAPIRoute}\nContent-type: application/json\n{\n  "content": "Hello #memos from ${window.location.origin}"\n}`}</pre>
        </div>
      </div>
    </>
  );
};

export default MyAccountSection;
