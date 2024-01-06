export class Embed {
  public title: string;
  public description: string;
  public url: string;
  public color: number;
  public timestamp: string;
  public image: {
    url: string;
  };
  public footer: {
    text: string;
    iconURL: string;
  };

  constructor({
    title, description, url, color, timestamp, image, footer
  }: Embed) {
    this.title = title;
    this.description = description;
    this.url = url;
    this.color = color;
    this.timestamp = timestamp;
    this.image = image;
    this.footer = footer;
  }
}