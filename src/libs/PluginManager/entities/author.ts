
export class Author {
  public id: string;
  public username: string;
  public avatarURL: string;
  public isBot: boolean;
  public language: string;

  constructor({
    id, username, avatarURL, isBot, language
  }: Author) {
    this.id = id;
    this.username = username;
    this.avatarURL = avatarURL;
    this.isBot = isBot;
    this.language = language;
  }
}