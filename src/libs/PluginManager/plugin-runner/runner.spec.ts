import { beforeEach, describe, expect, it } from "bun:test";
import { PluginRunner } from ".";
import { Command } from "../@types/Command";
import { Request } from "../@types/Request";

describe("PluginRunner", () => {
  const pluginRunner = new PluginRunner();

  const mockRequest: Request = {
    content: "test",
    createdAt: Date.now(),
    sender: {
      avatar: "https://placekitten.com/200/300",
      id: "123456789",
      isBot: false,
      name: "test",
    },
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
    const mockResponse = {
      send: async (content: string) => {
        expect(content).toBe("test");
      },
    };

    pluginRunner.run("test", mockRequest, mockResponse as any);
  });

  it("should throw an error if a command does not exist", () => {
    const mockResponse = {
      send: async () => {
        return;
      },
    };

    expect(async () => {
      await pluginRunner.run("test2", mockRequest, mockResponse as any);
    }).toThrow();
  });
});
