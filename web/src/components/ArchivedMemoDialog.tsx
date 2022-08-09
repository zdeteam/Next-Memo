import { useEffect, useState } from "react";
import useLoading from "../hooks/useLoading";
import { memoService } from "../services";
import { useAppSelector } from "../store";
import Icon from "./Icon";
import { generateDialog } from "./Dialog";
import toastHelper from "./Toast";
import ArchivedMemo from "./ArchivedMemo";
import "../less/archived-memo-dialog.less";

interface Props extends DialogProps {}

const ArchivedMemoDialog: React.FC<Props> = (props: Props) => {
  const { destroy } = props;
  const memos = useAppSelector((state) => state.memo.memos);
  const loadingState = useLoading();
  const [archivedMemos, setArchivedMemos] = useState<Memo[]>([]);

  useEffect(() => {
    memoService
      .fetchArchivedMemos()
      .then((result) => {
        setArchivedMemos(result);
      })
      .catch((error) => {
        toastHelper.error("Failed to fetch archived memos: ", error);
      })
      .finally(() => {
        loadingState.setFinish();
      });
  }, [memos]);

  return (
    <>
      <div className="dialog-header-container">
        <p className="title-text">
          <span className="icon-text">🗂</span>
          Archived Memos
        </p>
        <button className="btn close-btn" onClick={destroy}>
          <Icon.X className="icon-img" />
        </button>
      </div>
      <div className="dialog-content-container">
        {loadingState.isLoading ? (
          <div className="tip-text-container">
            <p className="tip-text">fetching data...</p>
          </div>
        ) : archivedMemos.length === 0 ? (
          <div className="tip-text-container">
            <p className="tip-text">No archived memos.</p>
          </div>
        ) : (
          <div className="archived-memos-container">
            {archivedMemos.map((memo) => (
              <ArchivedMemo key={`${memo.id}-${memo.updatedTs}`} memo={memo} />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default function showArchivedMemoDialog(): void {
  generateDialog(
    {
      className: "archived-memo-dialog",
    },
    ArchivedMemoDialog,
    {}
  );
}
