import { useCallback, useEffect, useState } from "react";
import Crown from "@strapi/icons/Crown";
import { Icon } from "@strapi/design-system/Icon";
import * as utils from "../helpers/utils";
import userService from "../services/userService";
import { locationService } from "../services";
import { useAppSelector } from "../store";
import "../less/user-banner.less";

interface Props {}

const UserBanner: React.FC<Props> = () => {
  const { user, owner } = useAppSelector((state) => state.user);
  const { memos, tags } = useAppSelector((state) => state.memo);
  const [shouldShowPopupBtns, setShouldShowPopupBtns] = useState(false);
  const [username, setUsername] = useState("Memos");
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

  const handlePopupBtnClick = () => {
    setShouldShowPopupBtns(true);
  };

  return (
    <>
      <div className="user-banner-container">
        <div className="username-container" onClick={handleUsernameClick}>
          {!isVisitorMode && user?.role === "HOST" ? (
            <Icon width={`${30 / 16}rem`} height={`${30 / 16}rem`} color="danger500" as={Crown} />
          ) : null}
          <span className="username-text">{username}</span>
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

export default UserBanner;
