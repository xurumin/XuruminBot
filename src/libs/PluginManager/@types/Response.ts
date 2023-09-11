export interface Response {
  send: (content: string) => Promise<any>;
}
