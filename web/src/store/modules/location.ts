import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Duration {
  from: number;
  to: number;
}

export interface Query {
  tag?: string;
  duration?: Duration;
  type?: MemoSpecType;
  text?: string;
  shortcutId?: ShortcutId;
}

interface State {
  pathname: string;
  hash: string;
  query: Query;
}

const getStateFromLocation = () => {
  const { pathname, search, hash } = window.location;

  const urlParams = new URLSearchParams(search);
  const state: State = {
    pathname: pathname,
    hash: hash,
    query: {},
  };

  if (search !== "") {
    state.query = {};
    state.query.tag = urlParams.get("tag") ?? undefined;
    state.query.type = (urlParams.get("type") as MemoSpecType) ?? undefined;
    state.query.text = urlParams.get("text") ?? undefined;
    state.query.shortcutId = Number(urlParams.get("shortcutId")) ?? undefined;
    const from = parseInt(urlParams.get("from") ?? "0");
    const to = parseInt(urlParams.get("to") ?? "0");
    if (to > from && to !== 0) {
      state.query.duration = {
        from,
        to,
      };
    }
  }

  return state;
};

const locationSlice = createSlice({
  name: "location",
  initialState: getStateFromLocation(),
  reducers: {
    setQuery: (state, action: PayloadAction<Partial<Query>>) => {
      if (JSON.stringify(action.payload) === state.query) {
        return state;
      }

      return {
        ...state,
        query: {
          ...state.query,
          ...action.payload,
        },
      };
    },
  },
});

export const { setQuery } = locationSlice.actions;

export default locationSlice.reducer;
