import { locationService, userService } from "../../../../services";
import useI18n from "../../../../hooks/useI18n";
import { GoCalendar, GoSettings, GoTrashcan, GoFileMedia, GoX, GoHome } from "react-icons/go";
import { Calendar, Only, HeatMap2, Dialog } from "@/components";
import showDailyReviewDialog from "../DailyReviewDialog";
import showSettingDialog from "../SettingDialog";
import showResourcesDialog from "../ResourcesDialog";
// import HeatMap from "../HeatMap";
// import ShortcutList from "../ShortcutList";
import "./index.less";
import { useAppSelector } from "@/store";
import { useCallback, useEffect, useState } from "react";
import * as utils from "@/helpers/utils";
import * as api from "@/helpers/api";
import { useNavigate } from "react-router-dom";

interface Props {
  closePopup: () => void;
}

const Index: React.FC<Props> = (props) => {
  const { t } = useI18n();
  // const user = useAppSelector((state) => state.user.user as User);
  // console.log("user", user);

 

  console.log(t("sidebar.setting"));
  // console.log('123stat',stat)
  const handleMyAccountBtnClick = () => {
    showSettingDialog();
  };

  const handleResourcesBtnClick = () => {
    showResourcesDialog();
  };

  const navigate = useNavigate();
  const { user, owner } = useAppSelector((state) => state.user);
  const { memos, tags,stat } = useAppSelector((state) => state.memo);
  // const stat = useAppSelector((state)=>state.memo.stat)
  console.log('123stat',stat)
  const [shouldShowPopupBtns, setShouldShowPopupBtns] = useState(false);
  const [username, setUsername] = useState("Memos");
  const [tagsVisible, setTagsVisible] = useState(false);
  const [profile, setProfile] = useState<Profile>();
  const [createdDays, setCreatedDays] = useState(0);
  const isVisitorMode = userService.isVisitorMode();

  useEffect(() => {
    if (isVisitorMode) {
      if (!owner) {
        return;
      }
      setUsername(owner.name);
      setCreatedDays(Math.ceil((Date.now() - utils.getTimeStampByDate(owner.createdTs)) / 1000 / 3600 / 24));
    } else if (user) {
      setUsername(user.name);
      setCreatedDays(Math.ceil((Date.now() - utils.getTimeStampByDate(user.createdTs)) / 1000 / 3600 / 24));
    }
  }, [isVisitorMode, user, owner]);

  const handleAllNotesClick = useCallback(() => {
    locationService.clearQuery();
    props.closePopup();
  }, []);

  useEffect(() => {
    try {
      api.getSystemStatus().then(({ data }) => {
        const {
          data: { profile },
        } = data;
        setProfile(profile);
      });
    } catch (error) {
      setProfile({
        mode: "dev",
        version: "0.0.0",
      });
    }
  }, []);

  const handlePopupBtnClick = () => {
    setShouldShowPopupBtns(true);
  };

  return (
    <aside className="sidebar-wrapper">
      <div className="user-banner-container">
        <div className="user">
          <img onClick={() => navigate("/setting")} src="/images/logo.png" alt="" />
          <span>{username}</span>
        </div>
        <span
          onClick={() => {
            Dialog.alert({
              title: "添加方法",
              message: "使用【默认浏览器】打开有墨轻记，进入页面后打开菜单栏，选择【添加到主屏幕】",
            });
          }}
        >
          添加到桌面
        </span>
      </div>

      <div className="heatMap">
        <HeatMap2
          data={stat.heatMap}
          onClick={props.closePopup}
          i18n={{
            previousMonth: "Previous month",
            nextMonth: "Next month",
            months: ["01月", "02月", "03月", "04月", "05月", "06月", "07月", "08月", "09月", "10月", "11月", "12月"],
            weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            weekdaysShort: ["日", "一", "二", "三", "四", "五", "六"],
          }}
        />
      </div>
      <div className="amount-text-container">
        <div>
          <span>{stat.notesNum}</span>
          <span>NOTES</span>
        </div>
        <div>
          <span>{tags.length}</span>
          <span>TAGS</span>
        </div>
        <div>
          <span>{createdDays}</span>
          <span>DAYS</span>
        </div>
      </div>
      <div className="menu-list">
        {/* <div className="item" onClick={handleAllNotesClick}>
          <div>
            <img
              src="data:image/png;base64,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"
              alt=""
            />
            <span>全部笔记</span>
          </div>
          <div>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANqADAAQAAAABAAAANgAAAADzQy6kAAADEUlEQVRoBe1YPYgTQRTO7iYESWcXMKCNTTgD+S0j5kAExSKljeh12nhi4V/l2eidgoeNhaIWVtZW4k9z5MciHMFDPEQDFzlREAIGxKzfO25lWDITc/tmrpmFMLPvbfK+73tvXmY2FrOXVcAqYBWwClgFrAJWAauAVWAXFPB939mFsFshtQVuNpsXEaHqum69WCz+Nk3Q1RGw0WhcRbYW8TkxGo2eYfR0xFH9JjuxVqu1gID02bpAqg7bE4zssYIY40bWUkT5UZaoBMddD8vl8pzjOP44J7eNTcV2u50AqRkFwDPI3H2Fn9XFmrFer7en3++/AMGqAuXdSqUyr/CzuNgyRmgymcyvVCp1HOW2okB3Ac3lpsLP4mIlRoiy2ewALf4YyLUVCK9gPV5X+CO7WEtRRNPtdvcOBoNXsB0S7eIc5C+hoSyKNq45e8YCYMjcj0QiMYv794EtPGIt3kZDOR+2c9xrI0bg8vn8N8/zaph+lIEFuXtYc3My/07t2kpRBIT1lAGBt7DtF+3BHCU5wud0qVR6GtiijkaIEchOp3NgOBwSuX0S0H9A7ijW3EuJfyqz1lIUkeRyuU+4rwH8V9EuzGk/eUu4jzQ1RoxQ4o/5A4ZHMsQo14My37R2o8TQJOYB/rICZFPhm8pljBgdZYBsSYYOJfozHo+ztX4jxNAVb4DQv6NMmBxIfcdu5UihUJD+54W/M+k+PumBqP4JRxn6+U2QmsUpezVqLPH72to91pKDXcUyxnNiQHGOTG2AVA2k1kQ7x1xLxkDGRaYeAOBZBcjP26TWFc/s2MVODKQ8ZOoxEJ2SoUKm1mlNIVNfZM9EtbOWIp2it1/e1GXAQGoN3a+GfeSG7BkOO1tXpDUFUs8xqkitJpPJqm5SJAwbMWQCnPzXCrXf4XR9GFurTcUzbC42YoQIW6Y7GK6F0YH0Ch1f6IwW9um6Z11jAUg0jwWUJe00YiD1ht6D0CuDwG9i1EKMgIPcEkpzJp1On6SXPCbIGItBXdJYMBvIKmAVsApYBawCVgGrgFXAKvCfCvwF5+bysL/RBPAAAAAASUVORK5CYII="
              alt=""
            />
          </div>
        </div> */}
        <div className="item" onClick={() => navigate('/tag')}>
          <div>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAASKADAAQAAAABAAAASAAAAACQMUbvAAAEAUlEQVR4Ae1bvWobQRC2hKTOzgMEAm4UF4HgFA5KEbALF34Cd+4EIaUL5xHiwlUIAXXp/AQuVEiQxiSFjbtEjSGQB3DcWULK9112zueL73a1p/uJmYVj73ZnZr/9bmdvd+5uaUmTMqAMKAPKgDKgDCgDyoAyoAwoA8qAMlAxBmpZ8cxms9rW1la7Vqu9gK1HWe3loH8FjGeDwWAEjLN57WciaHNz8zka/AwAzCudQM4FAO4Nh0PmzsmbIEPON5DTcm6tZEGQdAMIG/OQ1PDBbNyKI0fIOUfjxzh++9jLUwcYV3Dsoo114gVG4l5H7uRuXiMIo+cpGvluOnbebrdf9nq9cZ4dzWK72+02R6PRV5JEOyBnDaPoh4vNuotQXAYNcEIOEs6Pq0wOQRIfcf5FHBAU4peypNyLIBgLn1ZouHJudV9nYzhD/PfJRst8CYraeNDnSpDl9ipBSpCFAUu1jiAlyMKApdprJW2x6VSNDe776XT6Go/fNy5Lf25tsDj9VK/Xv2Dj+c6pkQUIleJiIOcxyDkA/g6Ot479oFyHetR31MksVgpBjUZjOYJ8JXKedhrKxfTTdDLXFepivPOmc6uCHC62vL29vSbXSflkMlmGi0n1KnSWUHYNd/slhXnkhRFk5pyDmxtGHG4TXGYHZTu3JfYzyJ+IFOwe5jknFeZinJClU4vM87IrGAsbQXxaoVFOtJxL6C7BqEH5T1yf4rClDnSeUAg6HEHXOLhR/ogjt1QYQeZR3mVPOOdE3OoUdQxopSY85hmuCAhqNpv7/X5f4lGpelkrC3OxrEDL0leCLMwrQUqQhQFLtY4gJcjCgKVaR5ASZGHAUl3YQtG8qg5W0uPxOLqb75hFoAVqEBoJZKB/BJ1wJe0ST7IZT6ovjCAGuwCC8Z87yWwfghXynYqUC9mmGJFnyF+liGeqKmwOYiQwE9IE5bzsSnOFjSCGJBCa+CDxIAlZoIMnKNsXQEk5Yj9HDI2wvtVqMb98UPEgdkyCWwx2SYK7XLtsPM2cI2qXLjoinCUvzMWiIHnnI9eu7/ZDuZh+xNTiT0shiCMJrnWI7jAO5BrPodwp9WQkLp6Ofy0WNgfFm+acFC9LuzaP8tyeVkltlzKCksBUsVwJstwVJUgJsjBgqdYRpARZGLBU+46gK7GLlXD4zlzKqpjHcIb4bVi9CEJjZ2IY57v8Dlmuq5gTH3EKtih+KUvKvT4kRwP8geUcufyj8V98aU8S8Fb2AotU5y/tvVbSaGSGzeMecvlXg5/580i6EZUoB15+OUHczkC9XIy9NUv/DTQ2198zZTFlcM71IwuxerlYtJPG3R7s/2LRvuq5MqAMKAPKgDKgDCgDyoAyoAy4MvAH/StlcsuDb1MAAAAASUVORK5CYII="
              alt=""
            />
            <span>我的标签</span>
          </div>
          <div style={tagsVisible ? { transform: "rotate(90deg)" } : {}}>
            <img
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANqADAAQAAAABAAAANgAAAADzQy6kAAADEUlEQVRoBe1YPYgTQRTO7iYESWcXMKCNTTgD+S0j5kAExSKljeh12nhi4V/l2eidgoeNhaIWVtZW4k9z5MciHMFDPEQDFzlREAIGxKzfO25lWDITc/tmrpmFMLPvbfK+73tvXmY2FrOXVcAqYBWwClgFrAJWAauAVWAXFPB939mFsFshtQVuNpsXEaHqum69WCz+Nk3Q1RGw0WhcRbYW8TkxGo2eYfR0xFH9JjuxVqu1gID02bpAqg7bE4zssYIY40bWUkT5UZaoBMddD8vl8pzjOP44J7eNTcV2u50AqRkFwDPI3H2Fn9XFmrFer7en3++/AMGqAuXdSqUyr/CzuNgyRmgymcyvVCp1HOW2okB3Ac3lpsLP4mIlRoiy2ewALf4YyLUVCK9gPV5X+CO7WEtRRNPtdvcOBoNXsB0S7eIc5C+hoSyKNq45e8YCYMjcj0QiMYv794EtPGIt3kZDOR+2c9xrI0bg8vn8N8/zaph+lIEFuXtYc3My/07t2kpRBIT1lAGBt7DtF+3BHCU5wud0qVR6GtiijkaIEchOp3NgOBwSuX0S0H9A7ijW3EuJfyqz1lIUkeRyuU+4rwH8V9EuzGk/eUu4jzQ1RoxQ4o/5A4ZHMsQo14My37R2o8TQJOYB/rICZFPhm8pljBgdZYBsSYYOJfozHo+ztX4jxNAVb4DQv6NMmBxIfcdu5UihUJD+54W/M+k+PumBqP4JRxn6+U2QmsUpezVqLPH72to91pKDXcUyxnNiQHGOTG2AVA2k1kQ7x1xLxkDGRaYeAOBZBcjP26TWFc/s2MVODKQ8ZOoxEJ2SoUKm1mlNIVNfZM9EtbOWIp2it1/e1GXAQGoN3a+GfeSG7BkOO1tXpDUFUs8xqkitJpPJqm5SJAwbMWQCnPzXCrXf4XR9GFurTcUzbC42YoQIW6Y7GK6F0YH0Ch1f6IwW9um6Z11jAUg0jwWUJe00YiD1ht6D0CuDwG9i1EKMgIPcEkpzJp1On6SXPCbIGItBXdJYMBvIKmAVsApYBawCVgGrgFXAKvCfCvwF5+bysL/RBPAAAAAASUVORK5CYII="
              alt=""
            />
          </div>
        </div>
        <Only when={!userService.isVisitorMode()}>
          {/*<div onClick={handleMyAccountBtnClick}>*/}
          {/*  <GoSettings /> {t("sidebar.setting")}*/}
          {
            /*</div>*/
            <div className="item" onClick={() => navigate("/trash")}>
              <div>
                <img
                  src="data:image/png;base64,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"
                  alt=""
                />
                <span>废纸篓</span>
              </div>
              <div>
                <img
                  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA2CAYAAACMRWrdAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAANqADAAQAAAABAAAANgAAAADzQy6kAAADEUlEQVRoBe1YPYgTQRTO7iYESWcXMKCNTTgD+S0j5kAExSKljeh12nhi4V/l2eidgoeNhaIWVtZW4k9z5MciHMFDPEQDFzlREAIGxKzfO25lWDITc/tmrpmFMLPvbfK+73tvXmY2FrOXVcAqYBWwClgFrAJWAauAVWAXFPB939mFsFshtQVuNpsXEaHqum69WCz+Nk3Q1RGw0WhcRbYW8TkxGo2eYfR0xFH9JjuxVqu1gID02bpAqg7bE4zssYIY40bWUkT5UZaoBMddD8vl8pzjOP44J7eNTcV2u50AqRkFwDPI3H2Fn9XFmrFer7en3++/AMGqAuXdSqUyr/CzuNgyRmgymcyvVCp1HOW2okB3Ac3lpsLP4mIlRoiy2ewALf4YyLUVCK9gPV5X+CO7WEtRRNPtdvcOBoNXsB0S7eIc5C+hoSyKNq45e8YCYMjcj0QiMYv794EtPGIt3kZDOR+2c9xrI0bg8vn8N8/zaph+lIEFuXtYc3My/07t2kpRBIT1lAGBt7DtF+3BHCU5wud0qVR6GtiijkaIEchOp3NgOBwSuX0S0H9A7ijW3EuJfyqz1lIUkeRyuU+4rwH8V9EuzGk/eUu4jzQ1RoxQ4o/5A4ZHMsQo14My37R2o8TQJOYB/rICZFPhm8pljBgdZYBsSYYOJfozHo+ztX4jxNAVb4DQv6NMmBxIfcdu5UihUJD+54W/M+k+PumBqP4JRxn6+U2QmsUpezVqLPH72to91pKDXcUyxnNiQHGOTG2AVA2k1kQ7x1xLxkDGRaYeAOBZBcjP26TWFc/s2MVODKQ8ZOoxEJ2SoUKm1mlNIVNfZM9EtbOWIp2it1/e1GXAQGoN3a+GfeSG7BkOO1tXpDUFUs8xqkitJpPJqm5SJAwbMWQCnPzXCrXf4XR9GFurTcUzbC42YoQIW6Y7GK6F0YH0Ch1f6IwW9um6Z11jAUg0jwWUJe00YiD1ht6D0CuDwG9i1EKMgIPcEkpzJp1On6SXPCbIGItBXdJYMBvIKmAVsApYBawCVgGrgFXAKvCfCvwF5+bysL/RBPAAAAAASUVORK5CYII="
                  alt=""
                />
              </div>
            </div>
          }
        </Only>
      </div>
    </aside>
  );
};

export const toggleSiderbar = () => {
  const sidebarEl = document.body.querySelector(".sidebar-wrapper") as HTMLDivElement;
  const display = window.getComputedStyle(sidebarEl).display;
  if (display === "none") {
    sidebarEl.style.display = "flex";
  } else {
    sidebarEl.style.display = "none";
  }
};

export default Index;
