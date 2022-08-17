import "./MentionList.less";
import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import {useAppSelector} from "../../store";

interface Props {
  items: Array<string>;
  command: ({ id }: { id: any }) => void;
}
// eslint-disable-next-line react/display-name
export default forwardRef((props: Props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { memos, tags } = useAppSelector((state) => state.memo);
  const selectItem = (index: number) => {
    const item = tags[index];
    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + tags.length - 1) % tags.length);
  };
  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % tags.length);
  };
  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [tags]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: any }) => {
      if (event.key === "ArrowUp") {
        upHandler();
        return true;
      }
      if (event.key === "ArrowDown") {
        downHandler();
        return true;
      }
      if (event.key === "Enter") {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="items">
      {tags.length ? (
          tags.map((item, index) => (
          <button className={`item ${index === selectedIndex ? "is-selected" : ""}`} key={index} onClick={() => selectItem(index)}>
            {item}
          </button>
        ))
      ) : (
        <div className="item">No result</div>
      )}
    </div>
  );
});
