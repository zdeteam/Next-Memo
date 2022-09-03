import React, { useCallback, useEffect, useState } from "react";
import { memoService, shortcutService } from "../../../../services";
import { useAppSelector } from "../../../../store";
import SearchBar from "../SearchBar";
import { toggleSiderbar } from "../Sidebar";
import "./index.less";

let prevRequestTimestamp = Date.now();

interface Props {
  onClick:()=>void;
}

const Index: React.FC<Props> = (props) => {
  const query = useAppSelector((state) => state.location.query);
  const shortcuts = useAppSelector((state) => state.shortcut.shortcuts);
  const [titleText, setTitleText] = useState("");

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let msg = "";

    const EarlyMorning = "早上好"; // 5~8
    const LateMorning = "上午好"; //11 ~ 12
    const EarlyAfternoon = "下午好"; // 13~15
    const Evening = "晚上好"; // 17~21
    const Night = "夜深了，早点休息"; //21~4

    if (hour >= 5 && hour < 9) msg = EarlyMorning;
    if (hour >= 9 && hour < 13) msg = LateMorning;
    if (hour >= 13 && hour < 17) msg = EarlyAfternoon;
    if (hour >= 17 && hour < 22) msg = Evening;
    if (hour >= 23 && hour < 5) msg = Night;

    return msg;
  };

  useEffect(() => {
    if (!query?.shortcutId) {
      setTitleText(getGreetingMessage());
      return;
    }

    const shortcut = shortcutService.getShortcutById(query?.shortcutId);
    if (shortcut) {
      setTitleText(shortcut.title);
    }
  }, [query, shortcuts]);

  const handleTitleTextClick = useCallback(() => {
    const now = Date.now();
    if (now - prevRequestTimestamp > 10 * 1000) {
      prevRequestTimestamp = now;
      memoService.fetchAllMemos().catch(() => {
        // do nth
      });
    }
  }, []);

  return (
    <div className="memos-header-container">
      <div className="title-container">
        <div className="action-btn" >
          {/*<Icon.Menu className="icon-img" />*/}
        </div>
        <span className="title-text" onClick={props.onClick}>
          {titleText}
        </span>
      </div>
      <SearchBar />
    </div>
  );
};

export default Index;
