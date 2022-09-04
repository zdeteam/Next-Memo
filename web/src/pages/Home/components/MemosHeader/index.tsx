import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { memoService, shortcutService } from "../../../../services";
import { useAppSelector } from "../../../../store";
import SearchBar from "../SearchBar";
import { toggleSiderbar } from "../Sidebar";
import "./index.less";

let prevRequestTimestamp = Date.now();

interface Props {
  onClick: () => void;
}

const Index: React.FC<Props> = (props) => {
  const { user } = useAppSelector((state) => state.user);
  const query = useAppSelector((state) => state.location.query);
  const shortcuts = useAppSelector((state) => state.shortcut.shortcuts);
  const [titleText, setTitleText] = useState("");

  const navigate = useNavigate();

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
    if (now - prevRequestTimestamp > 1 * 1000) {
      prevRequestTimestamp = now;
      memoService.fetchAllMemos().catch(() => {
        // do nth
      });
    }
  }, []);

  return (
    <div className="memos-header-container">
      <div className="title-container">
        <div className="action-btn">{/*<Icon.Menu className="icon-img" />*/}</div>
        <span className="title-text" onClick={props.onClick}>
          {`${titleText}, ${user?.name}`}
        </span>
      </div>
      <div className="handle-container">
        <img
          onClick={() => navigate("/search")}
          src="data:image/png;base64,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"
          alt=""
        />
        {/* <img className="Refresh_refresh__JLz92" src="/light-note/static/media/refresh.1cedf06e.svg" alt=""></img> */}
      </div>
    </div>
  );
};

export default Index;
