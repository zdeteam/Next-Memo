import { useRef, useState } from "react";
import { useAppSelector } from "../store";
import toImage from "../labs/html2image";
import useToggle from "../hooks/useToggle";
import { DAILY_TIMESTAMP } from "../helpers/consts";
import * as utils from "../helpers/utils";
import { generateDialog } from "./Dialog";
import DatePicker from "./common/DatePicker";
import Button from "./common/Button";
import DailyMemo from "./DailyMemo";
import ProseMirrorEditor from "./Editor/ProseMirrorEditor";
import "../less/daily-review-dialog.less";

interface Props extends DialogProps {
  currentDateStamp: DateStamp;
}

const monthChineseStrArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dev"];
const weekdayChineseStrArray = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DailyReviewDialog: React.FC<Props> = (props: Props) => {
  const memos = useAppSelector((state) => state.memo.memos);
  const [currentDateStamp, setCurrentDateStamp] = useState(utils.getDateStampByDate(utils.getDateString(props.currentDateStamp)));
  const [showDatePicker, toggleShowDatePicker] = useToggle(false);
  const memosElRef = useRef<HTMLDivElement>(null);
  const currentDate = new Date(currentDateStamp);
  const dailyMemos = memos
    .filter(
      (m) =>
        m.rowStatus === "NORMAL" &&
        utils.getTimeStampByDate(m.createdTs) >= currentDateStamp &&
        utils.getTimeStampByDate(m.createdTs) < currentDateStamp + DAILY_TIMESTAMP
    )
    .sort((a, b) => utils.getTimeStampByDate(a.createdTs) - utils.getTimeStampByDate(b.createdTs));

  const handleShareBtnClick = () => {
    if (!memosElRef.current) {
      return;
    }

    toggleShowDatePicker(false);

    toImage(memosElRef.current, {
      backgroundColor: "#ffffff",
      pixelRatio: window.devicePixelRatio * 2,
    })
      .then((url) => {
        const link = document.createElement("a");
        link.download = "每日回顾";
        link.href = url;
        link.click();
      })
      .catch(() => {});
  };

  const handleDataPickerChange = (datestamp: DateStamp): void => {
    setCurrentDateStamp(datestamp);
    toggleShowDatePicker(false);
  };

  return (
    <div className="daily-review-wrapper">
      <div className="content" ref={memosElRef}>
        <div className="date-card-container">
          {showDatePicker && (
            <DatePicker className={`date-picker`} datestamp={currentDateStamp} handleDateStampChange={handleDataPickerChange} />
          )}
          <div className="year-text">{currentDate.getFullYear()}</div>
          <div className="date-container" onClick={() => toggleShowDatePicker()}>
            <div className="month-text">{monthChineseStrArray[currentDate.getMonth()]}</div>
            <div className="date-text">{currentDate.getDate()}</div>
            <div className="day-text">{weekdayChineseStrArray[currentDate.getDay()]}</div>
          </div>
        </div>
        {dailyMemos.length === 0 ? (
          <div className="tip-container">
            <p className="tip-text">Oops, there is nothing.</p>
          </div>
        ) : (
          <div className="dailymemos-wrapper">
            {dailyMemos.map((memo) => (
              <DailyMemo key={`${memo.id}-${memo.updatedTs}`} memo={memo} />
            ))}
          </div>
        )}
      </div>
      <Button onClick={handleShareBtnClick}>分享卡片</Button>
    </div>
  );
};

export default function showDailyReviewDialog(datestamp: DateStamp = Date.now()): void {
  generateDialog(
    {
      title: "每日回顾",
      className: "daily-review-dialog",
    },
    DailyReviewDialog,
    { currentDateStamp: datestamp }
  );
}
