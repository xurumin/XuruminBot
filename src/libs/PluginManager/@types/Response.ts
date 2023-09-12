import type Eris from "eris";

interface Content extends Eris.InteractionContent {
  /** Show only to the user who invoked the command */
  ephemeral?: boolean;
}

export interface Response {
  send: (content: string | Content, file?: Eris.FileContent | Eris.FileContent[] | undefined) => Promise<void>;
}
