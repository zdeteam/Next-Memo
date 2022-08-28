import { useEffect, useState } from "react";
import { validate, ValidatorConfig } from "../../../../helpers/validator";
import useI18n from "../../../../hooks/useI18n";
import { userService } from "../../../../services";
import Input from "../../../../components/Input";
import Button from "../../../../components/Button";
import { generateDialog } from "../../../../components/Dialog";
import { Toast } from "@/components";

import "./index.less";

const validateConfig: ValidatorConfig = {
  minLength: 4,
  maxLength: 24,
  noSpace: true,
  notEmpty: true,
  noChinese: true,
};

interface Props extends DialogProps {}

const Index: React.FC<Props> = ({ destroy }: Props) => {
  const { t } = useI18n();
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
      Toast.info("Please fill in all fields.");
      return;
    }

    if (newPassword !== newPasswordAgain) {
      Toast.info("New passwords do not match.");
      setNewPasswordAgain("");
      return;
    }

    const passwordValidResult = validate(newPassword, validateConfig);
    if (!passwordValidResult.result) {
      Toast.info("Password " + passwordValidResult.reason);
      return;
    }

    try {
      const user = userService.getState().user as User;
      await userService.patchUser({
        id: user.id,
        password: newPassword,
      });
      Toast.info("Password changed.");
      handleCloseBtnClick();
    } catch (error: any) {
      console.error(error);
      Toast.info(error.response.data.message);
    }
  };

  return (
    <>
      <div className="dialog-content-container">
        <Input fullWidth type="password" placeholder="New passworld" value={newPassword} onChange={handleNewPasswordChanged} />
        <Input
          fullWidth
          type="password"
          placeholder="Repeat the new password"
          value={newPasswordAgain}
          onChange={handleNewPasswordAgainChanged}
        />
        <div className="btns-container">
          <Button fullWidth onClick={handleSaveBtnClick}>
            {t("common.save")}
          </Button>
        </div>
      </div>
    </>
  );
};

function showChangePasswordDialog() {
  generateDialog(
    {
      title: "Change Password",
      className: "change-password-dialog",
    },
    Index
  );
}

export default showChangePasswordDialog;
