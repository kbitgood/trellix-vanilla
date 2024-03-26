export type BoardData = {
  id: string;
  name: string;
  color: string;
};
export type UserData = {
  id: string;
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
