import { useEffect, useState } from "react";
import { Button } from "@strapi/design-system/Button";
import { TextInput } from "@strapi/design-system/TextInput";
import { validate, ValidatorConfig } from "../helpers/validator";
import { userService } from "../services";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import toastHelper from "./Toast";
import "../less/change-password-dialog.less";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  noChinese: true,
};

interface Props extends DialogProps {}

const ChangePasswordDialog: React.FC<Props> = ({ destroy }: Props) => {
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordAgain, setNewPasswordAgain] = useState("");

  useEffect(() => {
    // do nth
  }, []);

  const handleCloseBtnClick = () => {
    destroy();
  };

  const handleNewPasswordChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNewPassword(text);
  };

  const handleNewPasswordAgainChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value as string;
    setNewPasswordAgain(text);
  };

  const handleSaveBtnClick = async () => {
    if (newPassword === "" || newPasswordAgain === "") {
      toastHelper.error("Please fill in all fields.");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      toastHelper.error("New passwords do not match.");
      setNewPasswordAgain("");
      return;
    }

    const passwordValidResult = validate(newPassword, validateConfig);
    if (!passwordValidResult.result) {
      toastHelper.error("Password " + passwordValidResult.reason);
      return;
    }

    try {
      const user = userService.getState().user as User;
      await userService.patchUser({
        id: user.id,
        password: newPassword,
      });
      toastHelper.info("Password changed.");
      handleCloseBtnClick();
    } catch (error: any) {
      toastHelper.error(error);
    }
  };

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">Change Password</p>
        <button className="btn close-btn" onClick={handleCloseBtnClick}>
          <Icon.X />
        </button>
      </div>
      <div className="dialog-content-container">
        <TextInput label="New passworld" type="password" value={newPassword} onChange={handleNewPasswordChanged} />
        <TextInput label="Repeat the new password" type="password" value={newPasswordAgain} onChange={handleNewPasswordAgainChanged} />
        <div className="btns-container">
          <Button variant="ghost" onClick={handleCloseBtnClick}>
            Cancel
          </Button>
          <Button onClick={handleSaveBtnClick}>Save</Button>
        </div>
      </div>
    </>
  );
};

function showChangePasswordDialog() {
  generateDialog(
    {
      className: "change-password-dialog",
    },
    ChangePasswordDialog
  );
}

export default showChangePasswordDialog;
