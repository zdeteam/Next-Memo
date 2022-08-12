import { stringify } from "qs";
import store from "../store";
import { setQuery, Query } from "../store/modules/location";

const updateLocationUrl = (method: "replace" | "push" = "replace") => {
  console.log('updateLocationUrl')
  const { query, hash } = store.getState().location;
  let queryString = stringify(query);
  if (queryString) {
    queryString = "?" + queryString;
  } else {
    queryString = "";
  }

  if (method === "replace") {
    window.history.replaceState(null, "", window.location.pathname + hash + queryString);
  } else {
    window.history.pushState(null, "", window.location.pathname + hash + queryString);
  }
};

const locationService = {
  getState: () => {
    return store.getState().location;
  },



  replaceHistory: (pathname: string) => {
    updateLocationUrl("replace");
  },

  setQuery: (query: Query) => {
    store.dispatch(setQuery(query));
    updateLocationUrl();
  },

  clearQuery: () => {
    store.dispatch(
      setQuery({
        tag: undefined,
        type: undefined,
        duration: undefined,
        text: undefined,
        shortcutId: undefined,
      })
    );
    updateLocationUrl();
  },

  setMemoTypeQuery: (type?: MemoSpecType) => {
    store.dispatch(
      setQuery({
        type: type,
      })
    );
    updateLocationUrl();
  },

  setMemoShortcut: (shortcutId?: ShortcutId) => {
    store.dispatch(
      setQuery({
        shortcutId: shortcutId,
      })
    );
    updateLocationUrl();
  },

  setTextQuery: (text?: string) => {
    store.dispatch(
      setQuery({
        text: text,
      })
    );
    updateLocationUrl();
  },

  setTagQuery: (tag?: string) => {
    store.dispatch(
      setQuery({
        tag: tag,
      })
    );
    updateLocationUrl();
  },

  setFromAndToQuery: (from?: number, to?: number) => {
    let duration = undefined;
    if (from && to && from < to) {
      duration = {
        from,
        to,
      };
    }

    store.dispatch(
      setQuery({
        duration,
      })
    );
    updateLocationUrl();
  },
};

export default locationService;
