import { useEffect, useRef, Ref, useState, useImperativeHandle, forwardRef } from "react";
import { memoService, shortcutService, editorStateService } from "@/services";
import store, { useAppSelector } from "@/store";
import { setStat } from "@/store/modules/memo";
import useI18n from "@/hooks/useI18n";
// import store from "@/store";
import { getMemoStat } from "@/helpers/api";
import { IMAGE_URL_REG, LINK_URL_REG, MEMO_LINK_REG, TAG_REG } from "@/helpers/consts";
import * as utils from "@/helpers/utils";
import { checkShouldShowMemoWithFilters } from "@/helpers/filter";
import { Toast, NoMore, Memo, Loading, Only, List } from "@/components";
// import Memo from "@/components/Memo";
import "./index.less";

// eslint-disable-next-line react/display-name
const MemoList = forwardRef((props, ref: Ref<{ reRefresh: () => void }>) => {
  const { t } = useI18n();
  const query = useAppSelector((state) => state.location.query);
  const { memos, total } = useAppSelector((state) => state.memo);
  const [noMore, setNoMore] = useState(false);
  const [noData, setNoData] = useState(false);
  const wrapperElement = useRef<HTMLDivElement>(null);
  const [memoList, setMemoList] = useState<any>([]);
  const [finished, setFinished] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);

  const { tag: tagQuery, duration, type: memoType, text: textQuery, shortcutId } = query ?? {};
  const shortcut = shortcutId ? shortcutService.getShortcutById(shortcutId) : null;

  const reRefresh = async () => {
    setMemoList([]);
    setFinished(false);
    setOffset(0);

    const stat = await getMemoStat();
    store.dispatch(setStat(stat.data));
    memoService.updateTagsState();
  };

  useImperativeHandle(ref, () => {
    return {
      reRefresh: async () => {
        await reRefresh();
      },
    };
  });

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

  const onLoad = async () => {
    const { total, list } = await getData();
    console.log('listlist',list)
    if (total === 0) {
      setFinished(true);
      setNoMore(true);
      return setNoData(true);
    }
    setNoMore(false)
    setMemoList((v: any[]) => [...v, ...list]);
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
              { name: "删除", action: "delete", callback: reRefresh },
            ]}
          />
        ))}
      </List>
      {noData && (
        <div className="no-data">
          <img src="/images/no-data.png" />
          <span>轻松记录，随时保存</span>
        </div>
      )}
      {noMore && <NoMore />}
    </div>
  );
});

export default MemoList;
