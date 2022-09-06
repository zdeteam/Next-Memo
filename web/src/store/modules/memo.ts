import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface State {
  memos: Memo[];
  tags: string[];
  isFetching: boolean;
  total: number;
  stat: Stat;
}

const memoSlice = createSlice({
  name: "memo",
  initialState: {
    memos: [],
    tags: [],
    // isFetching flag should starts with true.
    isFetching: true,
    total: 0,
    stat: {
      notesNum: 0,
      heatMap: {},
    },
  } as State,
  reducers: {
    setStat: (state, action: PayloadAction<Stat>) => {
      return {
        ...state,
        stat: action.payload,
      };
    },
    setMount: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        total: action.payload,
      };
    },
    setMemos: (state, action: PayloadAction<{ total: number; list: Memo[] }>) => {
      return {
        ...state,
        memos: action.payload.list.filter((m) => m.rowStatus === "NORMAL").sort((a, b) => b.createdTs - a.createdTs),
      };
    },
    createMemo: (state, action: PayloadAction<Memo>) => {
      return {
        ...state,
        memos: state.memos.concat(action.payload).sort((a, b) => b.createdTs - a.createdTs),
      };
    },
    patchMemo: (state, action: PayloadAction<Partial<Memo>>) => {
      return {
        ...state,
        memos: state.memos
          .map((memo) => {
            if (memo.id === action.payload.id) {
              return {
                ...memo,
                ...action.payload,
              };
            } else {
              return memo;
            }
          })
          .filter((memo) => memo.rowStatus === "NORMAL"),
      };
    },
    setTags: (state, action: PayloadAction<string[]>) => {
      return {
        ...state,
        tags: action.payload,
      };
    },
    setIsFetching: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isFetching: action.payload,
      };
    },
  },
});

export const { setMemos, setStat, setMount, createMemo, patchMemo, setTags, setIsFetching } = memoSlice.actions;

export default memoSlice.reducer;
