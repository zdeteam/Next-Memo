import { userService } from "../services";
import useI18n from "../hooks/useI18n";
import { GoCalendar, GoSettings, GoTrashcan, GoFileMedia, GoX, GoHome } from "react-icons/go";
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
import { useAppSelector } from "../store";

interface Props {}

const Sidebar: React.FC<Props> = () => {
  const { t } = useI18n();
  const user = useAppSelector((state) => state.user.user as User);
  console.log("user", user);

  console.log(t("sidebar.setting"));
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
          <GoX />
        </span>
      </div>
      <UserBanner />
      <UsageHeatMap />
      <div className="action-btns-container">
        <button className="btn action-btn" onClick={() => showDailyReviewDialog()}>
          <GoCalendar /> {t("sidebar.daily-review")}
        </button>
        <Only when={!userService.isVisitorMode()}>
          <button className="btn action-btn" onClick={handleMyAccountBtnClick}>
            <GoSettings /> {t("sidebar.setting")}
          </button>
          <button className="btn action-btn" onClick={handleArchivedBtnClick}>
            <GoTrashcan /> {t("sidebar.archived")}
          </button>
        </Only>
        <Only when={user?.id !== 101}>
          <button className="btn action-btn" onClick={() => (location.href = "/u/101")}>
            <GoHome /> {t("sidebar.umo")}
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
