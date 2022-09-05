import { memo, useEffect, useRef, useState } from "react";
import { indexOf } from "lodash-es";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { GoKebabHorizontal, GoCloudDownload, GoBook, GoBroadcast, GoTrashcan, GoPin } from "react-icons/go";
import { HiAnnotation } from "react-icons/hi";
import { IMAGE_URL_REG, UNKNOWN_ID } from "@/helpers/consts";
import { DONE_BLOCK_REG, TODO_BLOCK_REG } from "@/helpers/marked";
import { editorStateService, locationService, memoService, userService } from "@/services";
import Only from "../OnlyWhen";
import { Toast, ActionSheet, Dialog, ShareSheet } from "@/components";
import { useAppSelector } from "../../store";
import Image from "../Image";
import Editor from "../Editor";
import "./index.less";
import { setEditMemoId } from "@/store/modules/editor";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);

interface Props {
  memo: Memo;
  actions?: any[];
}

export const getFormatedMemoCreatedAtStr = (createdTs: number): string => {
  if (Date.now() - createdTs < 1000 * 60 * 60 * 24) {
    return dayjs(createdTs).fromNow();
  } else {
    return dayjs(createdTs).format("YYYY/MM/DD HH:mm:ss");
  }
};

const Index: React.FC<Props> = (props: Props) => {
  const navigate = useNavigate();
  const [memo, setMemo] = useState({ editable: false, ...props.memo });
  const [moreAction, setMoreAction] = useState(false);
  const [createdAtStr, setCreatedAtStr] = useState<string>(getFormatedMemoCreatedAtStr(memo.createdTs * 1000));
  const memoContainerRef = useRef<HTMLDivElement>(null);
  const memoContentContainerRef = useRef<HTMLDivElement>(null);
  const imageUrls = Array.from(memo.content.match(IMAGE_URL_REG) ?? []).map((s) => s.replace(IMAGE_URL_REG, "$1"));
  const isVisitorMode = userService.isVisitorMode();
  const editorState = useAppSelector((state) => state.editor);
  const [editable, setEditable] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  useEffect(() => {
    if (!memoContentContainerRef) {
      return;
    }

    if (Date.now() - memo.createdTs < 1000 * 60 * 60 * 24) {
      setInterval(() => {
        setCreatedAtStr(dayjs(memo.createdTs * 1000).fromNow());
      }, 1000 * 1);
    }
  }, []);

  useEffect(() => {
    console.log("editMemoId");
    if (memo.id === editorState.editMemoId) {
      setEditable(true);
    } else {
      setEditable(false);
    }
  }, [editorState.editMemoId]);

  const handleEditMemoClick = () => {
    // console.log(memo.id);
    // editorStateService.setEditMemoWithId(memo.id);
    // setMoreAction(false);
    navigate(`/edit/${memo.id}`);
  };

  const handleArchiveMemoClick = async () => {
    setMoreAction(false);
    Dialog.confirm({
      title: "移至废纸篓",
      message: "可在废纸篓中恢复数据",
      onConfirm: async () => {
        try {
          await memoService.patchMemo({
            id: memo.id,
            rowStatus: "ARCHIVED",
          });
          Toast.info("删除成功");
        } catch (error: any) {
          Toast.info(error.message);
        }

        if (editorStateService.getState().editMemoId === memo.id) {
          editorStateService.clearEditMemo();
        }
      },
    });
  };

  // const handleMemoContentClick = async (e: React.MouseEvent) => {
  //   const targetEl = e.target as HTMLElement;

  //   if (targetEl.className === "memo-link-text") {
  //     const memoId = targetEl.dataset?.value;
  //     const memoTemp = memoService.getMemoById(Number(memoId) ?? UNKNOWN_ID);

  //     if (memoTemp) {
  //       showMemoCardDialog(memoTemp);
  //     } else {
  //       Toast.info("MEMO not found");
  //       targetEl.classList.remove("memo-link-text");
  //     }
  //   } else if (targetEl.className === "umo-tag") {
  //     if (memo.editable) return false;
  //     const tagName = targetEl.innerText.slice(1);
  //     const currTagQuery = locationService.getState().query?.tag;
  //     if (currTagQuery === tagName) {
  //       locationService.setTagQuery(undefined);
  //     } else {
  //       locationService.setTagQuery(tagName);
  //     }
  //   } else if (targetEl.classList.contains("todo-block")) {
  //     if (userService.isVisitorMode()) {
  //       return;
  //     }

  //     const status = targetEl.dataset?.value;
  //     const todoElementList = [...(memoContentContainerRef.current?.querySelectorAll(`span.todo-block[data-value=${status}]`) ?? [])];
  //     for (const element of todoElementList) {
  //       if (element === targetEl) {
  //         const index = indexOf(todoElementList, element);
  //         const tempList = memo.content.split(status === "DONE" ? DONE_BLOCK_REG : TODO_BLOCK_REG);
  //         let finalContent = "";

  //         for (let i = 0; i < tempList.length; i++) {
  //           if (i === 0) {
  //             finalContent += `${tempList[i]}`;
  //           } else {
  //             if (i === index + 1) {
  //               finalContent += status === "DONE" ? "- [ ] " : "- [x] ";
  //             } else {
  //               finalContent += status === "DONE" ? "- [x] " : "- [ ] ";
  //             }
  //             finalContent += `${tempList[i]}`;
  //           }
  //         }
  //         await memoService.patchMemo({
  //           id: memo.id,
  //           content: finalContent,
  //         });
  //       }
  //     }
  //   }
  // };

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

  const handleDeleteMemoClick = async () => {
    setMoreAction(false);
    Dialog.confirm({
      title: "是否彻底删除",
      message: "删除后笔记不可恢复",
      onConfirm: async () => {
        try {
          await memoService.deleteMemoById(memo.id);
          await memoService.fetchAllMemos({ limit: 10, offset: 0 });
          Toast.info("删除成功");
        } catch (error: any) {
          Toast.info(error.message);
        }
      },
    });
  };

  const handleRestoreMemoClick = async () => {
    try {
      await memoService.patchMemo({
        id: memo.id,
        rowStatus: "NORMAL",
      });
      await memoService.fetchAllMemos({ limit: 10, offset: 0 });
      Toast.info("Restored successfully");
    } catch (error: any) {
      Toast.info(error.message);
    }
  };

  return (
    <div className={`memo-wrapper ${"memos-" + memo.id} ${memo.pinned && "pinned"} ${memo.editable && "editing"}`}>
      <div className="memo-top-wrapper">
        <span className="time-text">{createdAtStr}</span>
        {!userService.isVisitorMode() && !memo.editable && props.actions?.length !== 0 && <img src="/svg/menu.svg" onClick={moreActions} />}
      </div>
      <Editor
        foldable
        content={memo.content}
        editable={editable}
        onDoubleClick={handleEditMemoClick}
        onCancel={() => editorStateService.setEditMemoWithId(UNKNOWN_ID)}
      />
      <Only when={imageUrls.length > 0}>
        <div className="images-wrapper">
          {imageUrls.map((imgUrl, idx) => (
            <Image className="memo-img" key={idx} imgUrl={imgUrl} />
          ))}
        </div>
      </Only>
      {/* {!memo.editable && (
        <div className="card-status">
          <Only when={memo.pinned}>
            <GoPin />
          </Only>
        </div>
      )} */}
      {props.actions?.length && (
        <>
          <ActionSheet
            visible={moreAction}
            onCancel={() => setMoreAction(false)}
            // description='这是一段描述信息'
            actions={props.actions.map((action) => ({
              ...action,
              callback: () => {
                if (action.action === "delete") {
                  handleArchiveMemoClick();
                }
                if (action.action === "edit") {
                  // handleEditMemoClick();
                  navigate(`/edit/${memo.id}`);
                }
                if (action.action === "share") {
                  setMoreAction(false);
                  setShareVisible(true);
                }
                if (action.action === "deleteForever") {
                  handleDeleteMemoClick();
                }
                if (action.action === "restore") {
                  handleRestoreMemoClick();
                }
              },
            }))}
            cancelText="取消"
          />
          <ShareSheet
            visible={shareVisible}
            options={[
              { name: "复制链接", icon: "link" },
              { name: "分享卡片", icon: "poster" },
            ]}
            title="立即分享给好友"
            onCancel={() => setShareVisible(false)}
            onSelect={(option, index) => {
              console.log("option", option);
              console.log("index", index);
              setShareVisible(false);
            }}
          />
        </>
      )}
    </div>
  );
};

export default memo(Index);

{
  /* <div className="action-bar">
<GoBook onClick={() => clickCardMoreAction(handleShowMemoStoryDialog)} />
<HiAnnotation />
<GoPin onClick={() => clickCardMoreAction(handleTogglePinMemoBtnClick)} />
<GoPencil />
<GoCloudDownload onClick={() => clickCardMoreAction(handleGenMemoImageBtnClick)} />
<GoBroadcast
  onClick={() => clickCardMoreAction(() => handleVisibilitySelectorChange(memo.visibility === "PUBLIC" ? "PRIVATE" : "PUBLIC"))}
/>
<GoTrashcan onClick={} />
</div> */
}
