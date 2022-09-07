import { useEffect, useState, useRef, ElementRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMemoStat } from "@/helpers/api";
import useLoading from "@/hooks/useLoading";
import * as services from "@/services";
import { setStat } from "@/store/modules/memo";
import { Popup, Toast, Editor, Only } from "@/components";
import Sidebar from "./components/Sidebar";

import MemosHeader from "./components/MemosHeader";
// import MemoFilter from "./components/MemoFilter";
import MemoList from "./components/MemoList";
import "./index.less";
import store from "@/store";

function Index() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  const loadingState = useLoading();
  const listEl = useRef<ElementRef<typeof MemoList>>(null);

  useEffect(() => {
    services.userService
      .initialState()
      .catch()
      .finally(async () => {
        const { host, owner, user } = services.userService.getState();
        if (!host) {
          return navigate(`/signin`);
        }
        if (services.userService.isVisitorMode()) {
          if (!owner) {
            Toast.info("User not found");
          }
        } else {
          if (!user) {
            // locationService.replaceHistory();
            navigate(`/signin`);
          }
        }
        loadingState.setFinish();
      });
    services.memoService.updateTagsState();
  }, []);

  const onRefresh = async function () {
    listEl?.current?.sayHello();
    const stat = await getMemoStat();
    store.dispatch(setStat(stat.data));
    services.memoService.updateTagsState();
  };

  return (
    <section className="page-wrapper">
      {loadingState.isLoading ? null : (
        <div className="page-container">
          <Popup
            visible={visible}
            position="left"
            onClose={() => {
              setVisible(false);
            }}
          >
            <Sidebar closePopup={() => setVisible(false)} />
          </Popup>
          <main className="memos-wrapper">
            <div className="top">
              <MemosHeader onClick={() => setVisible(!visible)} onRefresh={onRefresh} />
              <Only when={!services.userService.isVisitorMode()}>
                <div className="editor">
                  <Editor editable clearWhenSave onSave={onRefresh} />
                </div>
              </Only>
            </div>
            <MemoList ref={listEl} />
          </main>
        </div>
      )}
    </section>
  );
}

export default Index;
