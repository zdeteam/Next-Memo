import { useState } from "react";
import Crown from "@strapi/icons/Crown";
// import { Icon } from "@strapi/design-system/Icon";
import { GoPerson, GoBeaker, GoHubot, GoOrganization } from "react-icons/go";

import { useAppSelector } from "../store";
import useI18n from "../hooks/useI18n";
import { generateDialog } from "./Dialog";
import MyAccountSection from "./Settings/MyAccountSection";
import PreferencesSection from "./Settings/PreferencesSection";
import MemberSection from "./Settings/MemberSection";
import AboutSection from "./Settings/AboutSection";
import "../less/setting-dialog.less";
import Icon from "./Icon";

type Props = DialogProps;

type SettingSection = "my-account" | "preferences" | "member";

interface State {
  selectedSection: SettingSection;
}

const SettingDialog: React.FC<Props> = (props: Props) => {
  const { destroy } = props;
  const { t } = useI18n();
  const user = useAppSelector((state) => state.user.user);
  const [state, setState] = useState<State>({
    selectedSection: "my-account",
  });

  const handleSectionSelectorItemClick = (settingSection: SettingSection) => {
    setState({
      selectedSection: settingSection,
    });
  };

  return (
    <div className="dialog-content-container">
      <div className="section-selector-container">
        <span className="section-title">{t("common.basic")}</span>
        <div className="section-items-container">
          <span
            onClick={() => handleSectionSelectorItemClick("my-account")}
            className={`section-item ${state.selectedSection === "my-account" ? "selected" : ""}`}
          >
            {t("setting.my-account")}
          </span>
          <span
            onClick={() => handleSectionSelectorItemClick("preferences")}
            className={`section-item ${state.selectedSection === "preferences" ? "selected" : ""}`}
          >
            {t("setting.preference")}
          </span>
        </div>
        {user?.role === "HOST" ? (
          <>
            <span className="section-title">{t("common.admin")}</span>
            <div className="section-items-container">
              <span
                onClick={() => handleSectionSelectorItemClick("member")}
                className={`section-item ${state.selectedSection === "member" ? "selected" : ""}`}
              >
                {t("setting.member")}
              </span>
            </div>
          </>
        ) : null}
      </div>
      <div className="section-content-container">
        {state.selectedSection === "my-account" ? (
          <MyAccountSection />
        ) : state.selectedSection === "preferences" ? (
          <PreferencesSection />
        ) : state.selectedSection === "member" ? (
          <MemberSection />
        ) : null}
      </div>
    </div>
  );
};

export default function showSettingDialog(): void {
  generateDialog(
    {
      className: "setting-dialog",
    },
    SettingDialog,
    {}
  );
}
