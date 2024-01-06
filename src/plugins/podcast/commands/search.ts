import { ApplicationCommandOptions, ComponentInteraction, ComponentInteractionSelectMenuData, TextableChannel } from 'eris';
import { Command } from '../../../libs/PluginManager/@types/Command'
import { Context } from '../../../libs/PluginManager/@types/context';
import { search } from '../libs/podcast';

export default class Cmd implements Command {
  name: string = "search";
  description: string = "Search for a podcast.";

  options?: ApplicationCommandOptions[] = [
    {
      name: "query",
      description: "The query to search for.",
      type: 3,
      required: true
    }
  ]

  async execute(context: Context) {
    const { interaction } = context;
    
    const query = (interaction.data.options?.at(0) as any).value as string;

    if(!query) return context.send("No search query provided!");

    const response = await search(query);

    if(!response) return context.send("No results found!");
    
    const shows = response.slice(0, 5);

    interaction.createMessage({
      components: [
        {
          type: 1,
          components: [
            {
              type: 3,
              custom_id: "podcast_search",
              options: shows.map((podcast) => ({
                label: podcast.trackName,
                value: podcast.feedUrl,
                description: podcast.artistName,
                emoji: {
                  name: "🎙️"
                }
              }))
            }
          ]
        }
      ]
    });
    
  }

  async handleInteraction(interaction: ComponentInteraction) {
    const show = (interaction.data as ComponentInteractionSelectMenuData).values.at(0);
    if(!show) return interaction.createMessage("No show provided!");


    
    await interaction.createMessage("Tocando...")
  }
}
