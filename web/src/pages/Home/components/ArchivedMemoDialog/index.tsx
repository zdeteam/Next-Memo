import { useEffect, useState } from "react";
import useLoading from "../../../../hooks/useLoading";
import { memoService } from "../../../../services";
import { useAppSelector } from "../../../../store";
import { generateDialog } from "../../../../components/Dialog";
import {Toast} from "@/components"
import ArchivedMemo from "../ArchivedMemo";
import "./index.less";

interface Props extends DialogProps {}

const Index: React.FC<Props> = (props: Props) => {
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
        console.error(error);
        Toast.info(error.response.data.message);
      })
      .finally(() => {
        loadingState.setFinish();
      });
  }, [memos]);

  return (
    <>
      <div className="dialog-content-container">
        {loadingState.isLoading ? (
          <div className="tip-text-container">
            <p className="tip-text">fetching data...</p>
          </div>
        ) : archivedMemos.length === 0 ? (
          <div className="tip-text-container">
            <p className="tip-text">这里空空的</p>
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
      title: "回收站",
    },
    Index,
    {}
  );
}
