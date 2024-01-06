import { Request } from "./request";
import { Response } from "./response";

export class Context {
  constructor(
    public request: Request,
    public response: Response
  ) {}
}