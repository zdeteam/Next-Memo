import React, { useCallback, useEffect, useState } from "react";
import { memoService, shortcutService } from "../services";
import { useAppSelector } from "../store";
import Icon from "./Icon";
import SearchBar from "./SearchBar";
import { toggleSiderbar } from "./Sidebar";
import "../less/memos-header.less";

let prevRequestTimestamp = Date.now();

interface Props {}

const MemosHeader: React.FC<Props> = () => {
  const query = useAppSelector((state) => state.location.query);
  const shortcuts = useAppSelector((state) => state.shortcut.shortcuts);
  const [titleText, setTitleText] = useState("");

  const getGreetingMessage = () => {
    const hour = new Date().getHours();
    let msg: string;
    const greetingsSchemaRaw = "早上好, 又是元气满满的一天;下午好, 喝杯奶茶吧;晚上好, 今天辛苦了;夜深了, 早点睡吧";
    const greetingsSchema = greetingsSchemaRaw.split(";");

    if (hour >= 18) msg = greetingsSchema[0];
    else if (hour >= 12) msg = greetingsSchema[1];
    else if (hour >= 6) msg = greetingsSchema[2];
    else if (hour >= 0) msg = greetingsSchema[3];
    else msg = "Hello";

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
    <div className="section-header-container memos-header-container">
      <div className="title-container">
        <div className="action-btn" onClick={toggleSiderbar}>
          <Icon.Menu className="icon-img" />
        </div>
        <span className="title-text" onClick={handleTitleTextClick}>
          {titleText}
        </span>
      </div>
      <SearchBar />
    </div>
  );
};

export default MemosHeader;
