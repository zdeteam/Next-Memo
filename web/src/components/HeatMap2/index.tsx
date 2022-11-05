import React from "react";
import moment from "moment";
import {Toast} from "@/components"
import "./index.less";
interface I18n {
  previousMonth: string;
  nextMonth: string;
  months: string[];
  weekdays: string[];
  weekdaysShort: string[];
}
const i18nz: I18n = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  weekdaysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

const range = (length: number) => Array(length).fill(null);

const sameDates = (d1: Date, d2: Date) => {
  return d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate() && d1.getFullYear() === d2.getFullYear();
};

const deltaDate = (date: Date, yearDelta: number, monthDelta = 0, dayDelta = 0) => {
  return new Date(date.getFullYear() + yearDelta, date.getMonth() + monthDelta, date.getDate() + dayDelta);
};

const abbreviationDays = (i18n: I18n, weekStart: number) => {
  return range(7).map((_, i) => (i >= 7 ? i18n.weekdaysShort[i - 7] : i18n.weekdaysShort[i]));
};

const generateMatrix = (date: Date, weekStart: number) => {
  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const diff = (firstDayOfMonth.getDay() < weekStart ? 7 : 0) + firstDayOfMonth.getDay() - weekStart;
  const startDate = new Date(date.getFullYear(), date.getMonth(), firstDayOfMonth.getDate() - diff);

  return range(6).map((row, i) => {
    return range(7).map((column, j) => {
      return new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i * 7 + j);
    });
  });
};

interface PickerProps {
  cursor: Date;
  weekStart: number;
  renderDay: (date: Date) => JSX.Element;
  renderHeader: () => JSX.Element;
  renderAbbreviations: () => JSX.Element;
  onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
}
function DatePicker({ cursor, weekStart, renderDay, renderHeader, renderAbbreviations, onKeyDown }: PickerProps) {
  const matrix = generateMatrix(cursor, weekStart);
  return (
    <table className="fus-datepicker" tabIndex={0} onKeyDown={onKeyDown}>
      <thead>
        {renderHeader()}
        {renderAbbreviations()}
      </thead>
      <tbody>
        {matrix.map((row) => (
          <tr key={"row" + row[0].toString()}>{row.map((date) => renderDay(date))}</tr>
        ))}
      </tbody>
    </table>
  );
}

interface DayProps {
  day: Date;
  date: Date;
  cursor: Date;
  colorLevel: number;
  onChange: (timestamp: number) => void;
  onCursorChange: (date: Date) => void;
}
const Day = ({ day, colorLevel=0, date, cursor, onChange, onCursorChange }: DayProps) => {
  const isSelected = sameDates(day, date);
  const isCursor = sameDates(day, cursor);
  const isToday = sameDates(day, new Date());
  const isPrevMonth = cursor.getMonth() === 0 ? day.getMonth() === 11 : day.getMonth() === cursor.getMonth() - 1;
  const isNextMonth = cursor.getMonth() === 11 ? day.getMonth() === 0 : day.getMonth() === cursor.getMonth() + 1;
  const isInThisMonth = !isPrevMonth && !isNextMonth;

  const levelClassName =
    colorLevel <= 0
      ? ""
      : colorLevel <= 1
      ? "stat-day-L1"
      : colorLevel <= 2
      ? "stat-day-L2"
      : colorLevel <= 4
      ? "stat-day-L3"
      : "stat-day-L4";

  const classNames = ["day"];
  if (!isInThisMonth || levelClassName === "") {
    classNames.push("grayed");
  }
  if (isSelected) {
    classNames.push("selected");
  }
  if (isCursor) {
    classNames.push("cursor");
  }
  if (isToday) {
    classNames.push("today");
  }

  classNames.push(levelClassName);

  const props = {
    ...(isInThisMonth && {
      onClick: () => {
        console.log("click", moment(day).unix());
        if (levelClassName === "") return Toast.info("没有笔记哦");
        onChange(moment(day).unix());
      },
      onMouseEnter: () => onCursorChange(day),
      onFocus: () => onCursorChange(day),
      tabIndex: 1,
    }),
  };

  return (
    <td {...props} className={classNames.join(" ")}>
      {day.getDate()}
    </td>
  );
};

interface AbbreviationsProps {
  i18n: I18n;
  weekStart: number;
}
const Abbreviations = ({ i18n, weekStart }: AbbreviationsProps) => {
  return (
    <tr className="weekdays">
      {abbreviationDays(i18n, weekStart).map((day: string) => (
        <td key={day} colSpan={1}>
          {day}
        </td>
      ))}
    </tr>
  );
};

interface HeaderProps {
  i18n: I18n;
  cursor: Date;
  prevMonthClick: (e: React.MouseEvent<HTMLElement>) => void;
  nextMonthClick: (e: React.MouseEvent<HTMLElement>) => void;
}
const Header = ({ i18n, cursor, prevMonthClick, nextMonthClick }: HeaderProps) => {
  return (
    <tr>
      {/* <th colSpan={1}>
        <a className="chevron" onClick={prevMonthClick}>
         ‹
        </a>
      </th>  */}
      <th colSpan={5}>
        {i18n.months[cursor.getMonth()]} {cursor.getFullYear()}
      </th>
      {/* <th colSpan={1}>
        <a className="chevron" onClick={nextMonthClick}>
          ›
        </a>
      </th> */}
    </tr>
  );
};

interface DemoProps {
  i18n: I18n;
  data: HeatMap;
  onClick: (params: any) => void;
}
interface DemoState {
  date: Date;
  cursor: Date;
  weekStart: number;
}
class DemoContainer extends React.Component<DemoProps, DemoState> {
  public state = {
    date: new Date(),
    cursor: new Date(),
    weekStart: 1,
  };

  private onChange = (date: Date) => {
    // this.setState({ date });
    this.props.onClick(date);
    console.log("onChange");
  };

  private onCursorChange = (cursor: Date) => {
    // this.setState({ cursor });
    // console.log('onCursorChange')
  };
  // console.log(pro)

  private onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    switch (e.key) {
      case "ArrowDown":
        this.onCursorChange(deltaDate(this.state.cursor, 0, 0, 7));
        break;
      case "ArrowUp":
        this.onCursorChange(deltaDate(this.state.cursor, 0, 0, -7));
        break;
      case "ArrowLeft":
        this.onCursorChange(deltaDate(this.state.cursor, 0, 0, -1));
        break;
      case "ArrowRight":
        this.onCursorChange(deltaDate(this.state.cursor, 0, 0, 1));
        break;
      case "Enter":
        this.onChange(this.state.cursor);
        break;
    }
  };

  private prevMonthClick = (e: React.MouseEvent<HTMLElement>) => {
    this.onCursorChange(deltaDate(this.state.cursor, 0, -1));
  };

  private nextMonthClick = (e: React.MouseEvent<HTMLElement>) => {
    this.onCursorChange(deltaDate(this.state.cursor, 0, 1));
  };

  public render() {
    return (
      <DatePicker
        cursor={this.state.cursor}
        weekStart={this.state.weekStart}
        onKeyDown={this.onKeyDown}
        renderDay={(day) => (
          <Day
            colorLevel={this.props.data[moment(day).format("YYYY-MM-DD")]}
            key={day.toString()}
            day={day}
            date={this.state.date}
            cursor={this.state.cursor}
            onChange={this.onChange}
            onCursorChange={this.onCursorChange}
          />
        )}
        renderAbbreviations={() => <Abbreviations i18n={this.props.i18n} weekStart={this.state.weekStart} />}
        renderHeader={() => (
          <Header
            i18n={this.props.i18n}
            cursor={this.state.cursor}
            prevMonthClick={this.prevMonthClick}
            nextMonthClick={this.nextMonthClick}
          />
        )}
      />
    );
  }
}

export default DemoContainer;

// ReactDOM.render(
//     <div className="wrapper">
//         <DemoContainer i18n={i18nz} />
//     </div>,
//     document.getElementById('root') as HTMLElement
// );
