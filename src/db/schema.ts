import { algos } from "../algos";

export type DatabaseSchema = {
  post: Post;
  sub_state: SubState;
};

export type Post = {
  uri: string;
  cid: string;
  indexedAt: string;
  feed: keyof typeof algos;
};

export type SubState = {
  service: string;
  cursor: number;
};
