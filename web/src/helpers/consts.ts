// UNKNOWN_ID is the symbol for unknown id
export const UNKNOWN_ID = -1;

// default animation duration
export const ANIMATION_DURATION = 200;

// millisecond in a day
export const DAILY_TIMESTAMP = 3600 * 24 * 1000;

// tag regex
export const TAG_REG = />#(\S+?)<\/span>/g;

// markdown image regex
export const IMAGE_URL_REG = /!\[.*?\]\((.+?)\)/g;

// markdown link regex
export const LINK_URL_REG = /\[(.*?)\]\((.+?)\)/g;

// linked memo regex
export const MEMO_LINK_REG = /@\[(.+?)\]\((.+?)\)/g;

export const VISIBILITY_SELECTOR_ITEMS = [
  { text: "PUBLIC", value: "PUBLIC" },
  { text: "PROTECTED", value: "PROTECTED" },
  { text: "PRIVATE", value: "PRIVATE" },
];
