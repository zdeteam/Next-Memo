import { useState } from "react";
import Crown from "@strapi/icons/Crown";
// import { Icon } from "@strapi/design-system/Icon";

import { useAppSelector } from "../store";
import { generateDialog } from "./Dialog";
import MyAccountSection from "./Settings/MyAccountSection";
import PreferencesSection from "./Settings/PreferencesSection";
import MemberSection from "./Settings/MemberSection";
import AboutSection from "./Settings/AboutSection";
import "../less/setting-dialog.less";
import Icon from "./Icon";

interface Props extends DialogProps {}

type SettingSection = "my-account" | "preferences" | "member" | "about";

interface State {
  selectedSection: SettingSection;
}

const SettingDialog: React.FC<Props> = (props: Props) => {
  const { destroy } = props;
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
      <button className="btn close-btn" onClick={destroy}>
        <Icon.X className="icon-img" />
      </button>
      <div className="section-selector-container">
        <span className="section-title">Basic</span>
        <div className="section-items-container">
          <span
            onClick={() => handleSectionSelectorItemClick("my-account")}
            className={`section-item ${state.selectedSection === "my-account" ? "selected" : ""}`}
          >
            <Icon.User className="icon-text" /> My account
          </span>
          <span
            onClick={() => handleSectionSelectorItemClick("preferences")}
            className={`section-item ${state.selectedSection === "preferences" ? "selected" : ""}`}
          >
            <Icon.Feather className="icon-text" /> Preferences
          </span>
          <span
            onClick={() => handleSectionSelectorItemClick("about")}
            className={`section-item ${state.selectedSection === "about" ? "selected" : ""}`}
          >
            <Icon.Heart className="icon-text" /> About
          </span>
        </div>
        {user?.role === "HOST" ? (
          <>
            <span className="section-title">Admin</span>
            <div className="section-items-container">
              <span
                onClick={() => handleSectionSelectorItemClick("member")}
                className={`section-item ${state.selectedSection === "member" ? "selected" : ""}`}
              >
                <Icon.Users className="icon-text" /> Member
              </span>
            </div>
          </>
        ) : null}
      </div>
      <div className="section-content-container">
        {state.selectedSection === "my-account" && <MyAccountSection />}
        {state.selectedSection === "preferences" && <PreferencesSection />}
        {state.selectedSection === "member" && <MemberSection />}
        {state.selectedSection === "about" && <AboutSection />}
      </div>
    </div>
  );
};

export default function showSettingDialog(): void {
  generateDialog(
    {
      className: "setting-dialog",
      useAppContext: true,
    },
    SettingDialog,
    {}
  );
}
