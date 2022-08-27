import { useCallback, useEffect, useState } from "react";
import Crown from "@strapi/icons/Crown";
import { Icon } from "@strapi/design-system/Icon";
import * as utils from "../../../../helpers/utils";
import userService from "../../../../services/userService";
import { locationService } from "../../../../services";
import { useAppSelector } from "../../../../store";
import "./index.less";
import * as api from "../../../../helpers/api";

interface Props {}

const Index: React.FC<Props> = () => {
  const { user, owner } = useAppSelector((state) => state.user);
  const { memos, tags } = useAppSelector((state) => state.memo);
  const [shouldShowPopupBtns, setShouldShowPopupBtns] = useState(false);
  const [username, setUsername] = useState("Memos");
  const [profile, setProfile] = useState<Profile>();
  const [createdDays, setCreatedDays] = useState(0);
  const isVisitorMode = userService.isVisitorMode();

  useEffect(() => {
    if (isVisitorMode) {
      if (!owner) {
        return;
      }
      setUsername(owner.name);
      setCreatedDays(Math.ceil((Date.now() - utils.getTimeStampByDate(owner.createdTs)) / 1000 / 3600 / 24));
    } else if (user) {
      setUsername(user.name);
      setCreatedDays(Math.ceil((Date.now() - utils.getTimeStampByDate(user.createdTs)) / 1000 / 3600 / 24));
    }
  }, [isVisitorMode, user, owner]);

  const handleUsernameClick = useCallback(() => {
    locationService.clearQuery();
  }, []);

  useEffect(() => {
    try {
      api.getSystemStatus().then(({ data }) => {
        const {
          data: { profile },
        } = data;
        setProfile(profile);
      });
    } catch (error) {
      setProfile({
        mode: "dev",
        version: "0.0.0",
      });
    }
  }, []);

  const handlePopupBtnClick = () => {
    setShouldShowPopupBtns(true);
  };

  return (
    <>
      <div className="user-banner-container">
        <div className="username-container" onClick={handleUsernameClick}>
          <span className="username-text">{username}</span>
          <span className="version">内测中 V{profile?.version}</span>
        </div>
      </div>
      <div className="amount-text-container">
        <div className="status-text memos-text">
          <span className="amount-text">{memos.length}</span>
          <span className="type-text">MEMO</span>
        </div>
        <div className="status-text tags-text">
          <span className="amount-text">{tags.length}</span>
          <span className="type-text">TAG</span>
        </div>
        <div className="status-text duration-text">
          <span className="amount-text">{createdDays}</span>
          <span className="type-text">DAY</span>
        </div>
      </div>
    </>
  );
};

export default Index;
