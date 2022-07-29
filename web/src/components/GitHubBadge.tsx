import { useEffect, useState } from "react";
import * as api from "../helpers/api";
import Icon from "./Icon";
import "../less/github-badge.less";

interface Props {}

const GitHubBadge: React.FC<Props> = () => {
  const [starCount, setStarCount] = useState(0);

  useEffect(() => {
    api.getRepoStarCount().then((data) => {
      setStarCount(data);
    });
  }, []);

  return (
    <a className="github-badge-container" href="https://github.com/usememos/memos">
      <div className="github-icon">
        <Icon.GitHub className="icon-img" />
        Star
      </div>
      <div className="count-text">
        {starCount || ""}
        <span className="icon-text">🌟</span>
      </div>
    </a>
  );
};

export default GitHubBadge;
