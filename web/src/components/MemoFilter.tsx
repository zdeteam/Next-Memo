import { useAppSelector } from "../store";
import { GoTag, GoCalendar, GoSearch, GoLightBulb,GoTelescope } from "react-icons/go";
import { locationService, shortcutService } from "../services";
import * as utils from "../helpers/utils";
import { getTextWithMemoType } from "../helpers/filter";
import "../less/memo-filter.less";

const MemoFilter = () => {
  const query = useAppSelector((state) => state.location.query);
  useAppSelector((state) => state.shortcut.shortcuts);
  const { tag: tagQuery, duration, type: memoType, text: textQuery, shortcutId } = query;
  const shortcut = shortcutId ? shortcutService.getShortcutById(shortcutId) : null;
  const showFilter = Boolean(tagQuery || (duration && duration.from < duration.to) || memoType || textQuery || shortcut);

  return (
    <div className={`filter-query-container ${showFilter ? "" : "!hidden"}`}>
      <span className="tip-text">我想看的:</span>
      {shortcut && (
        <div
          className="filter-item-container"
          onClick={() => {
            locationService.setMemoShortcut(undefined);
          }}
        >
          <GoTelescope /> {shortcut?.title}
        </div>
      )}
      {tagQuery && (
        <div
          className="filter-item-container"
          onClick={() => {
            locationService.setTagQuery(undefined);
          }}
        >
          <GoTag /> {tagQuery}
        </div>
      )}
      {memoType && (
        <div
          className="filter-item-container"
          onClick={() => {
            locationService.setMemoTypeQuery(undefined);
          }}
        >
          <GoLightBulb /> {getTextWithMemoType(memoType as MemoSpecType)}
        </div>
      )}

      {duration && duration.from < duration.to ? (
        <div
          className="filter-item-container"
          onClick={() => {
            locationService.setFromAndToQuery();
          }}
        >
          <GoCalendar /> {utils.getDateString(duration.from)} to {utils.getDateString(duration.to)}
        </div>
      ) : null}
      {textQuery && (
        <div
          className="filter-item-container"
          onClick={() => {
            locationService.setTextQuery("");
          }}
        >
          <GoSearch /> {textQuery}
        </div>
      )}
    </div>
  );
};

export default MemoFilter;
