import type Eris from "eris";
import { User } from "./User";

export interface Request {
  sender: User;
  content: string;
  createdAt: number;
  interaction: Eris.CommandInteraction<Eris.TextableChannel> | undefined;
}
