import type Eris from "eris";

export interface Response {
  send: (content: string | Eris.InteractionContent, file?: Eris.FileContent | Eris.FileContent[] | undefined) => Promise<void>;
}
