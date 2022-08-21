import { userService } from "../services";
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
          <GoCalendar className="icon" />
          <span>每日回顾</span>
        </button>
        <Only when={!userService.isVisitorMode()}>
          {/*<button className="btn action-btn" onClick={handleResourcesBtnClick}>*/}
          {/*  <GoFileMedia />*/}
          {/*  <span>我的文件</span>*/}
          {/*</button>*/}
          <button className="btn action-btn" onClick={handleMyAccountBtnClick}>
            <GoSettings />
            <span>系统设置</span>
          </button>
          <button className="btn action-btn" onClick={handleArchivedBtnClick}>
            <GoTrashcan />
            <span>回收站</span>
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
