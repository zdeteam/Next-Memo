import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NavBar, Button, Memo, Toast } from "@/components";
import useLoading from "@/hooks/useLoading";
import { memoService } from "@/services";
import { useAppSelector } from "@/store";
import { generateDialog } from "@/components/Dialog";
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
        <div className="trash-page">
            <NavBar title="回收站" leftText="返回" onClickLeft={() => navigation("/")} />
            <div className="list">
                {
                    archivedMemos.map((memo) =>
                        <Memo key={`${memo.id}-${memo.updatedTs}`} memo={memo}
                            actions={
                                [
                                    { name: '恢复笔记',action:'restore' },
                                    { name: '彻底删除',action:'deleteForever' }
                                ]
                            }
                        />
                    )
                }
            </div>
        </div>
    );
};

export default TrashPage;
