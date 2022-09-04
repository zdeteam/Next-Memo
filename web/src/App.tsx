import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import useI18n from "./hooks/useI18n";
import { globalService } from "./services";
import { useAppSelector } from "./store";

import * as storage from "./helpers/storage";

function App(props: any) {
  const { setLocale } = useI18n();
  const location = useLocation();
  const user = useAppSelector((state) => state.user.user);
  const global = useAppSelector((state) => state.global);
  const pathname = useAppSelector((state) => state.location.pathname);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    if (location.pathname.match(/note\//)) {
      return setLoading(false);
    }
    globalService.initialState().then(() => {
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (user?.setting.locale) {
      globalService.setLocale(user.setting.locale);
    }
  }, [user?.setting.locale]);

  useEffect(() => {
    setLocale(global.locale);
    storage.set({
      locale: global.locale,
    });
  }, [global.locale]);

  return <>{isLoading ? null : props.children}</>;
}

export default App;
