import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NoData, PageLayout, Memo, Toast } from "@/components";
import useLoading from "@/hooks/useLoading";
import { memoService } from "@/services";
import { useAppSelector } from "@/store";
// import Memo from "@/components/Memo";
import "./index.less";

const TrashPage = (props: any) => {
  const navigation = useNavigate();
  const { destroy } = props;
  const memos = useAppSelector((state: any) => state.memo.memos);
  const loadingState = useLoading();
  const [archivedMemos, setArchivedMemos] = useState<Memo[]>([]);

  useEffect(() => {
    memoService
      .fetchArchivedMemos()
      .then((result) => {
        console.log("result", result);
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
    <PageLayout title="废纸篓" className="trash-page" onClickLeft={() => navigation("/")}>
      {archivedMemos.map((memo) => (
        <Memo
          key={`${memo.id}-${memo.updatedTs}`}
          memo={memo}
          actions={[
            { name: "恢复笔记", action: "restore" },
            { name: "彻底删除", action: "deleteForever" },
          ]}
        />
      ))}
      {archivedMemos.length === 0 && <NoData />}
    </PageLayout>
  );
};

export default TrashPage;
