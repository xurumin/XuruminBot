import { Author } from "./author";
import { Message } from "./message";

interface Context {
  author: Author;
  message: Message;
  platform: string;
}

export class Request {
  public author: Author;
  public message: Message;
  public platform: string;

  constructor({
    author, message, platform
  }: Context) {
    this.author = author;
    this.message = message;
    this.platform = platform;
  }
}