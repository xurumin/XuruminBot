import { beforeEach, describe, expect, it } from "vitest";
import { PluginRunner } from ".";
import { Command } from "../@types/Command";
import { Request } from "../@types/Request";

describe("PluginRunner", () => {
  const pluginRunner = new PluginRunner();

  const mockRequest: Request = {
    content: "test",
    createdAt: new Date(),
    sender: {
      avatar: "https://placekitten.com/200/300",
      id: "123456789",
      isBot: false,
      name: "test",
    },
  };

  const mockCommand: Command = {
    name: "test",
    description: "test",
    execute: () => {
      return Promise.resolve();
    },
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
    pluginRunner.loadCommands([mockCommand]);
  });

  it("should load commands", () => {
    pluginRunner.commands = new Map();
    expect(pluginRunner.commands.size).toBe(0);

    pluginRunner.loadCommands([mockCommand]);
    expect(pluginRunner.commands.size).toBe(1);
  });

  it("should run a command", () => {
    const mockResponse = {
      send: async (content: string) => {
        expect(content).toBe("test");
      },
    };

    pluginRunner.run("test", mockRequest, mockResponse);
  });

  it("should throw an error if a command does not exist", () => {
    const mockResponse = {
      send: async () => {
        return;
      },
    };

    expect(async () => {
      await pluginRunner.run("test2", mockRequest, mockResponse);
    }).rejects.toThrow();
  });
});
