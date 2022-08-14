import { useState } from "react";
import Crown from "@strapi/icons/Crown";
// import { Icon } from "@strapi/design-system/Icon";
import { GoPerson, GoBeaker, GoHubot, GoOrganization } from "react-icons/go";

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
      <div className="section-selector-container">
        <span className="section-title">通用</span>
        <div className="section-items-container">
          <span
            onClick={() => handleSectionSelectorItemClick("my-account")}
            className={`section-item ${state.selectedSection === "my-account" ? "selected" : ""}`}
          >
            <GoPerson /> 我的账号
          </span>
          <span
            onClick={() => handleSectionSelectorItemClick("preferences")}
            className={`section-item ${state.selectedSection === "preferences" ? "selected" : ""}`}
          >
            <GoBeaker /> 高级配置
          </span>
        </div>
        <>
          <span className="section-title">更多</span>
          <div className="section-items-container">
            {user?.role === "HOST" ? (
              <span
                onClick={() => handleSectionSelectorItemClick("member")}
                className={`section-item ${state.selectedSection === "member" ? "selected" : ""}`}
              >
                <GoOrganization /> 用户管理
              </span>
            ) : null}
            {/*<span*/}
            {/*  onClick={() => handleSectionSelectorItemClick("install")}*/}
            {/*  className={`section-item ${state.selectedSection === "install" ? "selected" : ""}`}*/}
            {/*>*/}
            {/*  <GoHubot /> 安装快捷方式*/}
            {/*</span>*/}
            <span
              onClick={() => handleSectionSelectorItemClick("about")}
              className={`section-item ${state.selectedSection === "about" ? "selected" : ""}`}
            >
              <GoHubot /> 关于
            </span>
          </div>
        </>
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
    },
    SettingDialog,
    {}
  );
}
