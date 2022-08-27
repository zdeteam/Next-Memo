import { memo, useEffect, useRef, useState } from "react";
import { indexOf } from "lodash-es";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GoKebabHorizontal, GoCloudDownload, GoBook, GoBroadcast, GoTrashcan, GoPin } from "react-icons/go";
import { HiAnnotation } from "react-icons/hi";
import { IMAGE_URL_REG, UNKNOWN_ID } from "../../helpers/consts";
import { DONE_BLOCK_REG, TODO_BLOCK_REG } from "../../helpers/marked";
import { editorStateService, locationService, memoService, userService } from "../../services";
import Only from "../OnlyWhen";
import toastHelper from "../Toast";
import Image from "../Image";
import showMemoCardDialog from "../../pages/Home/components/MemoCardDialog";
import showShareMemoImageDialog from "../../pages/Home/components/ShareMemoImageDialog";
import Editor from "../Editor";
import "./index.less";

dayjs.extend(relativeTime);

interface Props {
  memo: Memo;
}

export const getFormatedMemoCreatedAtStr = (createdTs: number): string => {
  if (Date.now() - createdTs < 1000 * 60 * 60 * 24) {
    return dayjs(createdTs).fromNow();
  } else {
    return dayjs(createdTs).format("YYYY/MM/DD HH:mm:ss");
  }
};

const Index: React.FC<Props> = (props: Props) => {
  const [memo, setMemo] = useState({ editable: false, ...props.memo });
  const [moreAction, setMoreAction] = useState(false);
  const [createdAtStr, setCreatedAtStr] = useState<string>(getFormatedMemoCreatedAtStr(memo.createdTs));
  const memoContainerRef = useRef<HTMLDivElement>(null);
  const imageUrls = Array.from(memo.content.match(IMAGE_URL_REG) ?? []).map((s) => s.replace(IMAGE_URL_REG, "$1"));
  const isVisitorMode = userService.isVisitorMode();

  useEffect(() => {
    if (!memoContainerRef) {
      return;
    }

    if (Date.now() - memo.createdTs < 1000 * 60 * 60 * 24) {
      setInterval(() => {
        setCreatedAtStr(dayjs(memo.createdTs).fromNow());
      }, 1000 * 1);
    }
  }, []);

  const handleShowMemoStoryDialog = () => {
    showMemoCardDialog(memo);
  };

  const handleTogglePinMemoBtnClick = async () => {
    try {
      if (memo.pinned) {
        await memoService.unpinMemo(memo.id);
      } else {
        await memoService.pinMemo(memo.id);
      }
    } catch (error) {
      // do nth
    }
  };

  const handleMarkMemoClick = () => {
    editorStateService.setMarkMemoWithId(memo.id);
  };

  const handleEditMemoClick = () => {
    if (userService.isVisitorMode()) return false;
    // editorStateService.setEditMemoWithId(memo.id);
    setMoreAction(false);
    memo.editable = true;
    setMemo({ ...memo });
    editorStateService.setEditMemoWithId(memo.id);
  };

  const handleArchiveMemoClick = async () => {
    try {
      await memoService.patchMemo({
        id: memo.id,
        rowStatus: "ARCHIVED",
      });
    } catch (error: any) {
      toastHelper.error(error.message);
    }

    if (editorStateService.getState().editMemoId === memo.id) {
      editorStateService.clearEditMemo();
    }
  };

  const handleGenMemoImageBtnClick = () => {
    showShareMemoImageDialog(memo);
  };

  const handleMemoContentClick = async (e: React.MouseEvent) => {
    const targetEl = e.target as HTMLElement;

    if (targetEl.className === "memo-link-text") {
      const memoId = targetEl.dataset?.value;
      const memoTemp = memoService.getMemoById(Number(memoId) ?? UNKNOWN_ID);

      if (memoTemp) {
        showMemoCardDialog(memoTemp);
      } else {
        toastHelper.error("MEMO Not Found");
        targetEl.classList.remove("memo-link-text");
      }
    } else if (targetEl.className === "umo-tag") {
      if (memo.editable) return false;
      const tagName = targetEl.innerText.slice(1);
      const currTagQuery = locationService.getState().query?.tag;
      if (currTagQuery === tagName) {
        locationService.setTagQuery(undefined);
      } else {
        locationService.setTagQuery(tagName);
      }
    } else if (targetEl.classList.contains("todo-block")) {
      if (userService.isVisitorMode()) {
        return;
      }

      const status = targetEl.dataset?.value;
      const todoElementList = [...(memoContainerRef.current?.querySelectorAll(`span.todo-block[data-value=${status}]`) ?? [])];
      for (const element of todoElementList) {
        if (element === targetEl) {
          const index = indexOf(todoElementList, element);
          const tempList = memo.content.split(status === "DONE" ? DONE_BLOCK_REG : TODO_BLOCK_REG);
          let finalContent = "";

          for (let i = 0; i < tempList.length; i++) {
            if (i === 0) {
              finalContent += `${tempList[i]}`;
            } else {
              if (i === index + 1) {
                finalContent += status === "DONE" ? "- [ ] " : "- [x] ";
              } else {
                finalContent += status === "DONE" ? "- [x] " : "- [ ] ";
              }
              finalContent += `${tempList[i]}`;
            }
          }
          await memoService.patchMemo({
            id: memo.id,
            content: finalContent,
          });
        }
      }
    }
  };

  const moreActions = () => {
    setMoreAction(!moreAction);
  };

  const clickCardMoreAction = (callback: () => void) => {
    setMoreAction(false);
    callback();
  };

  const handleVisibilitySelectorChange = async (visibility: Visibility) => {
    if (memo.visibility === visibility) {
      return;
    }

    await memoService.patchMemo({
      id: memo.id,
      visibility: visibility,
    });
    setMemo({
      ...memo,
      visibility: visibility,
    });
  };

  return (
    <div
      onClick={handleMemoContentClick}
      onDoubleClick={handleEditMemoClick}
      className={`memo-wrapper ${"memos-" + memo.id} ${memo.pinned && "pinned"} ${memo.editable && "editing"} ${
        moreAction && "more-actions"
      }`}
    >
      <div className="memo-top-wrapper">
        <span className="time-text">{createdAtStr}</span>
        {!userService.isVisitorMode() && !memo.editable && <GoKebabHorizontal onClick={moreActions} />}
      </div>
      <Editor foldable cardMode content={memo.content} editable={memo.editable} onCancel={() => setMemo({ ...memo, editable: false })} />
      <Only when={imageUrls.length > 0}>
        <div className="images-wrapper">
          {imageUrls.map((imgUrl, idx) => (
            <Image className="memo-img" key={idx} imgUrl={imgUrl} />
          ))}
        </div>
      </Only>
      <Only when={moreAction}>
        <span className="double-click-tip">双击编辑轻笔记</span>
      </Only>
      {!memo.editable && (
        <div className="card-status">
          <Only when={memo.pinned}>
            <GoPin />
          </Only>
          <Only when={memo.visibility === "PUBLIC"}>
            <GoBroadcast />
          </Only>
        </div>
      )}
      <div className="action-bar">
        <GoBook onClick={() => clickCardMoreAction(handleShowMemoStoryDialog)} />
        <HiAnnotation />
        <GoPin onClick={() => clickCardMoreAction(handleTogglePinMemoBtnClick)} />
        {/*<GoPencil />*/}
        <GoCloudDownload onClick={() => clickCardMoreAction(handleGenMemoImageBtnClick)} />
        <GoBroadcast
          onClick={() => clickCardMoreAction(() => handleVisibilitySelectorChange(memo.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"))}
        />
        <GoTrashcan onClick={() => clickCardMoreAction(handleArchiveMemoClick)} />
      </div>
    </div>
  );
};

export default memo(Index);
