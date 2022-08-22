import { userService } from "../services";
import useI18n from "../hooks/useI18n";
import { GoCalendar, GoSettings, GoTrashcan, GoFileMedia } from "react-icons/go";
import Icon from "./Icon";
import Only from "./common/OnlyWhen";
import showDailyReviewDialog from "./DailyReviewDialog";
import showSettingDialog from "./SettingDialog";
import showArchivedMemoDialog from "./ArchivedMemoDialog";
import showResourcesDialog from "./ResourcesDialog";
import UserBanner from "./UserBanner";
import UsageHeatMap from "./UsageHeatMap";
import ShortcutList from "./ShortcutList";
import TagList from "./TagList";
import "../less/siderbar.less";

interface Props {}

const Sidebar: React.FC<Props> = () => {
  const { t } = useI18n();

  const handleMyAccountBtnClick = () => {
    showSettingDialog();
  };

  const handleResourcesBtnClick = () => {
    showResourcesDialog();
  };

  const handleArchivedBtnClick = () => {
    showArchivedMemoDialog();
  };

  return (
    <aside className="sidebar-wrapper">
      <div className="close-container">
        <span className="action-btn" onClick={toggleSiderbar}>
          <Icon.X className="icon-img" />
        </span>
      </div>
      <UserBanner />
      <UsageHeatMap />
      <div className="action-btns-container">
        <button className="btn action-btn" onClick={() => showDailyReviewDialog()}>
          <Icon.Calendar className="icon" /> {t("sidebar.daily-review")}
        </button>
        <Only when={!userService.isVisitorMode()}>
          <button className="btn action-btn" onClick={handleResourcesBtnClick}>
            <Icon.Image className="icon" />{t("sidebar.resources")}
          </button>
          <button className="btn action-btn" onClick={handleMyAccountBtnClick}>
            <Icon.Settings className="icon" /> {t("sidebar.setting")}
          </button>
          <button className="btn action-btn" onClick={handleArchivedBtnClick}>
            <Icon.Archive className="icon" /> {t("sidebar.archived")}
          </button>
        </Only>
      </div>
      {/*<Only when={!userService.isVisitorMode()}>*/}
      {/*  <ShortcutList />*/}
      {/*</Only>*/}
      <TagList />
    </aside>
  );
};

export const toggleSiderbar = () => {
  const sidebarEl = document.body.querySelector(".sidebar-wrapper") as HTMLDivElement;
  const display = window.getComputedStyle(sidebarEl).display;
  if (display === "none") {
    sidebarEl.style.display = "flex";
  } else {
    sidebarEl.style.display = "none";
  }
};

export default Sidebar;
