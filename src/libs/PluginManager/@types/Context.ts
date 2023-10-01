import { User } from "./User";
import type Eris from "eris";

interface Message {
  id: string;
  content: string;
  createdAt: number;
}

interface Content extends Eris.InteractionContent {
  /** Show only to the user who invoked the command */
  ephemeral?: boolean;
}

export interface Context {
  sender: User;
  message: Message;
  send: (content: string | Content, file?: Eris.FileContent | Eris.FileContent[] | undefined) => Promise<void>;
  eris: Eris.Client;
  interaction: Eris.CommandInteraction<Eris.TextableChannel> | undefined;
}