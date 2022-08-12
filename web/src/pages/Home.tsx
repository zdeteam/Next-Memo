import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@strapi/design-system/Button";
import { userService } from "../services";
import { useAppSelector } from "../store";
import useLoading from "../hooks/useLoading";
import Only from "../components/common/OnlyWhen";
import Sidebar from "../components/Sidebar";
import MemosHeader from "../components/MemosHeader";
import MemoEditor from "../components/MemoEditor";
import MemoFilter from "../components/MemoFilter";
import MemoList from "../components/MemoList";
import toastHelper from "../components/Toast";
import "../less/home.less";

function Home() {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.user.user);
  const location = useAppSelector((state) => state.location);
  const loadingState = useLoading();

  useEffect(() => {
    userService
      .initialState()
      .catch()
      .finally(async () => {
        const { host, owner, user } = userService.getState();
        if (!host) {
          return navigate(`/signin`);
        }
        if (userService.isVisitorMode()) {
          if (!owner) {
            toastHelper.error("User not found");
          }
        } else {
          if (!user) {
            // locationService.replaceHistory();
            navigate(`/u/${host.id}`);
          }
        }
        loadingState.setFinish();
      });
  }, [location]);

  return (
    <section className="page-wrapper home">
      {loadingState.isLoading ? null : (
        <div className="page-container">
          <Sidebar />
          <main className="memos-wrapper">
            <div className="memos-editor-wrapper">
              <MemosHeader />
              <Only when={!userService.isVisitorMode()}>
                <MemoEditor />
              </Only>
              <MemoFilter />
            </div>
            <MemoList />
            <Only when={userService.isVisitorMode()}>
              <div className="addtion-btn-container">
                {user ? (
                  <Button size="L" onClick={() => (window.location.href = "/")}>
                    Back to Home
                  </Button>
                ) : (
                  <Button size="L" onClick={() => (window.location.href = "/signin")}>
                    Welcome to OpenFlomo, go to login
                  </Button>
                )}
              </div>
            </Only>
          </main>
        </div>
      )}
    </section>
  );
}

export default Home;
