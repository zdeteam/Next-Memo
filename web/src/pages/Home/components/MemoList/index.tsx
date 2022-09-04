import { useEffect, useRef, useState } from "react";
import { memoService, shortcutService, editorStateService } from "@/services";
import { useAppSelector } from "@/store";
import useI18n from "@/hooks/useI18n";
import { IMAGE_URL_REG, LINK_URL_REG, MEMO_LINK_REG, TAG_REG } from "@/helpers/consts";
import * as utils from "@/helpers/utils";
import { checkShouldShowMemoWithFilters } from "@/helpers/filter";
import { Toast, NoMore, Memo, Loading, Only, List } from "@/components";
// import Memo from "@/components/Memo";
import "./index.less";

interface Props {}

const Index: React.FC<Props> = () => {
  const { t } = useI18n();
  const query = useAppSelector((state) => state.location.query);
  const { memos, total } = useAppSelector((state) => state.memo);
  const user = useAppSelector((state) => state.user.user);
  const [noMore, setNoMore] = useState(false);
  const wrapperElement = useRef<HTMLDivElement>(null);
  const [memoList, setMemoList] = useState<any>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);

  const { tag: tagQuery, duration, type: memoType, text: textQuery, shortcutId } = query ?? {};
  const shortcut = shortcutId ? shortcutService.getShortcutById(shortcutId) : null;
  const showMemoFilter = Boolean(tagQuery || (duration && duration.from < duration.to) || memoType || textQuery || shortcut);

  // const shownMemos =
  //   showMemoFilter || shortcut
  //     ? memos.filter((memo) => {
  //         let shouldShow = true;

  //         if (shortcut) {
  //           const filters = JSON.parse(shortcut.payload) as Filter[];
  //           if (Array.isArray(filters)) {
  //             shouldShow = checkShouldShowMemoWithFilters(memo, filters);
  //           }
  //         }

  //         if (tagQuery) {
  //           const tagsSet = new Set<string>();
  //           for (const t of Array.from(memo.content.match(TAG_REG) ?? [])) {
  //             const tag = t.replace(TAG_REG, "$1").trim();
  //             const items = tag.split("/");
  //             let temp = "";
  //             for (const i of items) {
  //               temp += i;
  //               tagsSet.add(temp);
  //               temp += "/";
  //             }
  //           }
  //           if (!tagsSet.has(tagQuery)) {
  //             shouldShow = false;
  //           }
  //         }
  //         if (
  //           duration &&
  //           duration.from < duration.to &&
  //           (utils.getTimeStampByDate(memo.createdTs) < duration.from || utils.getTimeStampByDate(memo.createdTs) > duration.to)
  //         ) {
  //           shouldShow = false;
  //         }
  //         if (memoType) {
  //           if (memoType === "NOT_TAGGED" && memo.content.match(TAG_REG) !== null) {
  //             shouldShow = false;
  //           } else if (memoType === "LINKED" && memo.content.match(LINK_URL_REG) === null) {
  //             shouldShow = false;
  //           } else if (memoType === "IMAGED" && memo.content.match(IMAGE_URL_REG) === null) {
  //             shouldShow = false;
  //           } else if (memoType === "CONNECTED" && memo.content.match(MEMO_LINK_REG) === null) {
  //             shouldShow = false;
  //           }
  //         }
  //         if (textQuery && !memo.content.includes(textQuery)) {
  //           shouldShow = false;
  //         }

  //         return shouldShow;
  //       })
  //     : memos;

  // const pinnedMemos = shownMemos.filter((m) => m.pinned);
  // const unpinnedMemos = shownMemos.filter((m) => !m.pinned);
  // const sortedMemos = pinnedMemos.concat(unpinnedMemos).filter((m) => m.rowStatus === "NORMAL");

  // useEffect(() => {

  // }, [user]);

  async function getData() {
    return new Promise<any>((resolve, reject) => {
      memoService
        .fetchAllMemos({ rowStatus: "NORMAL", limit: 10, offset })
        .then((data) => {
          resolve(data);
        })
        .catch((error) => {
          console.log(error);
          reject(new Error("error"));
        });
    });
  }

  useEffect(() => {
    wrapperElement.current?.scrollTo({
      top: 0,
    });
  }, [query]);

  const handleEditMemoClick = (memo: any) => {
    editorStateService.setEditMemoWithId(memo.id);
  };

  const onLoad = async () => {
    const { total, list } = await getData();
    // setMemoList([...memoList, ...list]);
    setMemoList((v) => [...v, ...list]);
    // console.log('totaltotaltotaltotal',total,memoList.length)
    if (memoList.length >= total) {
      setFinished(true);
      setNoMore(true);
    } else {
      setOffset(offset + 1);
    }
  };

  return (
    <div className="memo-list-container" ref={wrapperElement}>
      <List finished={finished} errorText="请求失败，点击重新加载" onLoad={onLoad}>
        {memoList.map((memo: any) => (
          <Memo
            key={`${memo.id}-${memo.updatedTs}`}
            memo={memo}
            actions={[
              { name: "分享", action: "share" },
              { name: "编辑", action: "edit" },
              { name: "删除", action: "delete" },
            ]}
          />
        ))}
      </List>

      {memoList.length === 0 && (
        <div className="no-data">
          <img src="/images/no-data.png" />
          <span>轻松记录，随时保存</span>
        </div>
      )}
      {noMore && <NoMore />}
    </div>
  );
};

export default Index;
