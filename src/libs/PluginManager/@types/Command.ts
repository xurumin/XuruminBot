import type Eris from "eris";
import { Request } from "./Request";
import { Response } from "./Response";

export interface Command {
  name: string;
  description: string;
  execute: (request: Request, response: Response) => Promise<void>;
  
  // Discord Slash Command Options
  options?: Eris.ApplicationCommandOptions[];
}
