import { globalService, userService } from "../../services";
import { useAppSelector } from "../../store";
import { VISIBILITY_SELECTOR_ITEMS } from "../../helpers/consts";
import useI18n from "../../hooks/useI18n";
import Selector from "../common/Selector";
import BetaBadge from "../BetaBadge";
import "../../less/settings/preferences-section.less";

const localeSelectorItems = [
  {
    text: "English",
    value: "en",
  },
  {
    text: "中文",
    value: "zh",
  },
];

const editorFontStyleSelectorItems = [
  {
    text: "Normal",
    value: "normal",
  },
  {
    text: "Mono",
    value: "mono",
  },
];

const PreferencesSection = () => {
  const { t } = useI18n();
  const { setting } = useAppSelector((state) => state.user.user as User);

  const handleLocaleChanged = async (value: string) => {
    await userService.upsertUserSetting("locale", value);
    globalService.setLocale(value as Locale);
  };

  const handleDefaultMemoVisibilityChanged = async (value: string) => {
    await userService.upsertUserSetting("memoVisibility", value);
  };

  const handleEditorFontStyleChanged = async (value: string) => {
    await userService.upsertUserSetting("editorFontStyle", value);
  };

  return (
    <div className="section-container preferences-section-container">
      <label className="form-label">
        <span className="normal-text">{t("common.language")}:</span>
        <Selector className="ml-2 w-28" value={setting.locale} dataSource={localeSelectorItems} handleValueChanged={handleLocaleChanged} />
        {/*<BetaBadge className="ml-2" />*/}
      </label>
      {/*<label className="form-label">*/}
      {/*  <span className="normal-text">{t("setting.preference-section.default-memo-visibility")}:</span>*/}
      {/*  <Selector*/}
      {/*    className="ml-2 w-32"*/}
      {/*    value={setting.memoVisibility}*/}
      {/*    dataSource={VISIBILITY_SELECTOR_ITEMS}*/}
      {/*    handleValueChanged={handleDefaultMemoVisibilityChanged}*/}
      {/*  />*/}
      {/*</label>*/}
    </div>
  );
};

export default PreferencesSection;
