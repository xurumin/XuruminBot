import { beforeEach, describe, expect, it } from "bun:test";
import { PluginRunner } from ".";
import { Command } from "../@types/Command";
import { Context } from "../@types/Context";

describe("PluginRunner", () => {
  const pluginRunner = new PluginRunner();

  const mockContext: Context = {
    message: {
      content: "test",
      createdAt: Date.now(),
      id: "123456789",
    },
    sender: {
      avatar: "https://placekitten.com/200/300",
      id: "123456789",
      isBot: false,
      name: "test",
    },
    eris: {} as any,
    send: async () => { },
    interaction: undefined,
  };
  beforeEach(() => {
    const mockCommand: Command = {
      name: "test",
      description: "test",
      execute: () => {
        return Promise.resolve();
      },
    };

    pluginRunner.commands = new Map();
    pluginRunner.commands.set("test", mockCommand);
  });

  it("should run a command", () => {
    mockContext.send = async (content: any, file?: any) => {
      expect(content).toBe("test");
    };

    pluginRunner.run("test", mockContext as any);
  });

  it("should throw an error if a command does not exist", () => {
    const mockResponse = {
      send: async () => {
        return;
      },
    };

    expect(async () => {
      await pluginRunner.run("test2", mockResponse as any);
    }).toThrow();
  });
});
