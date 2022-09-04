import React from 'react'
import "./index.less"
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
const DatePicker: React.SFC<PickerProps> = ({ cursor, weekStart, renderDay, renderHeader, renderAbbreviations, onKeyDown }) => {
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
};

interface DayProps {
  day: Date;
  date: Date;
  cursor: Date;
  onChange: (date: Date) => void;
  onCursorChange: (date: Date) => void;
}
const Day: React.SFC<DayProps> = ({ day, date, cursor, onChange, onCursorChange }) => {
  const isSelected = sameDates(day, date);
  const isCursor = sameDates(day, cursor);
  const isToday = sameDates(day, new Date());

  const isPrevMonth = cursor.getMonth() === 0 ? day.getMonth() === 11 : day.getMonth() === cursor.getMonth() - 1;
  const isNextMonth = cursor.getMonth() === 11 ? day.getMonth() === 0 : day.getMonth() === cursor.getMonth() + 1;
  const isInThisMonth = !isPrevMonth && !isNextMonth;

  const classNames = ["day"];
  if (!isInThisMonth) {
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

  const props = {
    ...(isInThisMonth && {
      onClick: () => onChange(day),
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
const Abbreviations: React.SFC<AbbreviationsProps> = ({ i18n, weekStart }) => {
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
const Header: React.SFC<HeaderProps> = ({ i18n, cursor, prevMonthClick, nextMonthClick }) => {
  return (
    <tr>
      <th colSpan={1}>
        <a className="chevron" onClick={prevMonthClick}>
          ‹
        </a>
      </th>
      <th colSpan={5}>
        {i18n.months[cursor.getMonth()]} {cursor.getFullYear()}
      </th>
      <th colSpan={1}>
        <a className="chevron" onClick={nextMonthClick}>
          ›
        </a>
      </th>
    </tr>
  );
};

interface DemoProps {
  i18n: I18n;
}
interface DemoState {
  date: Date;
  cursor: Date;
  weekStart: number;
}
class DemoContainer extends React.Component<DemoProps, DemoState> {
  public state = {
    date: new Date(2018, 1, 15),
    cursor: new Date(2018, 1, 10),
    weekStart: 1,
  };

  private onChange = (date: Date) => {
    this.setState({ date });
  };

  private onCursorChange = (cursor: Date) => {
    this.setState({ cursor });
  };

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
