import { Embed } from "./embed";

interface Context {
  content: string;
  embeds?: Embed[];
}

export class Message {
  public id?: string;
  public createdAt?: string;
  public updatedAt?: string;
  public content: string;
  public embeds: Embed[];

  constructor({
    content, embeds
  }: Context) {
    this.content = content;
    this.embeds = embeds || [];
  }
}