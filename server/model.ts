export type BoardData = {
  id: number;
  name: string;
  color: string;
};
export type UserData = {
  id: number;
  username: string;
};
export type ColumnData = {
  id: string;
  name: string;
  boardId: number;
  sortOrder: number;
};
export type ItemData = {
  id: string;
  text: string;
  columnId: string;
  sortOrder: number;
};
