type MemoId = number;

type Visibility = "PUBLIC" | "PROTECTED" | "PRIVATE";

interface Memo {
  id: MemoId;

  creatorId: UserId;
  createdTs: TimeStamp;
  updatedTs: TimeStamp;
  rowStatus: RowStatus;

  content: string;
  visibility: Visibility;
  pinned: boolean;
}

interface MemoCreate {
  content: string;
  visibility?: Visibility;
}

interface MemoPatch {
  id: MemoId;
  createdTs?: TimeStamp;
  rowStatus?: RowStatus;
  content?: string;
  visibility?: Visibility;
}

interface MemoFind {
  content?: string;
  tag?: string;
  creatorId?: UserId;
  rowStatus?: RowStatus;
  visibility?: Visibility;
  limit?: number;
  offset?: number;
  startTime?: number;
  endTime?:number;
}

interface HeatMap {
  [key: string]: number;
}

interface Stat {
  notesNum: number;
  heatMap: HeatMap;
}
