import type Eris from "eris";
import { Context } from "./Context";

export interface Command {
  name: string;
  description: string;
  execute: (context: Context) => Promise<void>;

  handleInteraction?: (interaction: Eris.ComponentInteraction | any) => Promise<void>;
  
  // Discord Slash Command Options
  options?: Eris.ApplicationCommandOptions[];
}
