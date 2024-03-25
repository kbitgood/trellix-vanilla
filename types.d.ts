declare namespace Model {
  export type Board = {
    id: number;
    name: string;
    color: string;
  };
  export type User = {
    id: number;
    username: string;
  };
  export type Column = {
    id: string;
    name: string;
    boardId: number;
  };
  export type Item = {
    id: string;
    text: string;
    columnId: string;
    sortOrder: number;
  };
}
