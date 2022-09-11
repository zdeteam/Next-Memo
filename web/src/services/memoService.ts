import * as api from "../helpers/api";
import { createMemo, patchMemo, setIsFetching, setMemos, setTags, setMount } from "../store/modules/memo";
import store from "../store";
import userService from "./userService";

const convertResponseModelMemo = (memo: Memo): Memo => {
  return {
    ...memo,
    createdTs: memo.createdTs * 1000,
    updatedTs: memo.updatedTs * 1000,
  };
};

const memoService = {
  getState: () => {
    return store.getState().memo;
  },

  fetchAllMemos: async (params: MemoFind) => {
    const timeoutIndex = setTimeout(() => {
      store.dispatch(setIsFetching(true));
    }, 1000);
    const memoFind: MemoFind = {
      limit: params.limit,
      offset: params.offset,
      rowStatus: params.rowStatus,
      content: params.content,
      tag: params.tag,
    };
    if (userService.isVisitorMode()) {
      memoFind.creatorId = userService.getUserIdFromPath();
    }
    const { data } = (await api.getMemoList(memoFind)).data;
    console.log(
      "data-----",
      data,
      data.list.map((m) => convertResponseModelMemo(m))
    );
    const response = { total: data.total, list: data.list.map((m) => convertResponseModelMemo(m)) };
    // const memos = data.list.filter((m) => m.rowStatus !== "ARCHIVED").map((m) => convertResponseModelMemo(m));
    store.dispatch(setMemos(response));
    store.dispatch(setMount(data.total));
    clearTimeout(timeoutIndex);
    store.dispatch(setIsFetching(false));

    return response;
  },

  fetchArchivedMemos: async () => {
    const memoFind: MemoFind = {
      rowStatus: "ARCHIVED",
    };
    if (userService.isVisitorMode()) {
      memoFind.creatorId = userService.getUserIdFromPath();
    }
    const { data } = (await api.getMemoList(memoFind)).data;
    const archivedMemos = data.list.map((m) => {
      return convertResponseModelMemo(m);
    });
    return archivedMemos;
  },

  getMemoById: async (memoId: MemoId) => {
    const { data } = await api.getMemoById(memoId);
    return { ...data.data, createdTs: data.data.createdTs * 1000 };
  },

  updateTagsState: async () => {
    const tagFind: TagFind = {};
    if (userService.isVisitorMode()) {
      tagFind.creatorId = userService.getUserIdFromPath();
    }
    const { data } = (await api.getTagList(tagFind)).data;
    store.dispatch(setTags(data));
  },

  getLinkedMemos: async (memoId: MemoId): Promise<Memo[]> => {
    const { memos } = memoService.getState();
    const regex = new RegExp(`[@(.+?)](${memoId})`);
    return memos.filter((m) => m.content.match(regex));
  },

  createMemo: async (memoCreate: MemoCreate) => {
    const { data } = (await api.createMemo(memoCreate)).data;
    const memo = convertResponseModelMemo(data);
    store.dispatch(createMemo(memo));
  },

  patchMemo: async (memoPatch: MemoPatch): Promise<Memo> => {
    const { data } = (await api.patchMemo(memoPatch)).data;
    const memo = convertResponseModelMemo(data);
    store.dispatch(patchMemo(memo));
    return memo;
  },

  pinMemo: async (memoId: MemoId) => {
    await api.pinMemo(memoId);
    store.dispatch(
      patchMemo({
        id: memoId,
        pinned: true,
      })
    );
  },

  unpinMemo: async (memoId: MemoId) => {
    await api.unpinMemo(memoId);
    store.dispatch(
      patchMemo({
        id: memoId,
        pinned: false,
      })
    );
  },

  deleteMemoById: async (memoId: MemoId) => {
    await api.deleteMemo(memoId);
  },
};

export default memoService;
