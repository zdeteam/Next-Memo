import store from "../store";
import * as api from "../helpers/api";
import * as storage from "../helpers/storage";
import {setStat} from "@/store/modules/memo";
import { setGlobalState, setLocale } from "../store/modules/global";
import { convertResponseModelUser } from "./userService";
import memoService from "./memoService";

const globalService = {
  getState: () => {
    return store.getState().global;
  },

  _initialState: async () => {
    const defaultGlobalState = {
      locale: "en" as Locale,
    };

    const { locale: storageLocale } = storage.get(["locale"]);
    if (storageLocale) {
      defaultGlobalState.locale = storageLocale;
    }
    try {
      const { data } = (await api.getMyselfUser()).data;
      const stat = await api.getMemoStat();
      store.dispatch(setStat(stat.data));
      memoService.updateTagsState();
      if (data) {
        const user = convertResponseModelUser(data);
        if (user.setting.locale) {
          defaultGlobalState.locale = user.setting.locale;
        }
      }
    } catch (error) {
      // do nth
    }

    store.dispatch(setGlobalState(defaultGlobalState));
  },
  get initialState() {
    return this._initialState;
  },
  set initialState(value) {
    this._initialState = value;
  },

  setLocale: (locale: Locale) => {
    store.dispatch(setLocale(locale));
  },
};

export default globalService;
