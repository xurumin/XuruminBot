import { User } from "./User";

export interface Request {
  sender: User;
  content: string;
  createdAt: number;
}
