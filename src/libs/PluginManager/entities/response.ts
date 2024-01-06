import { Message } from "./message";

export class Response {
  public reply (message: Message): Message {
    throw new Error("Not implemented");
  }

  public send (message: Message): Message {
    throw new Error("Not implemented");
  }
}