import 'dotenv/config';
import { GatewayIntentBits, Client } from 'discord.js';
import OpenAI from 'openai';
import {
  fetchOpenAIDialogue,
  createOpenAimp3,
  joinAndPlay,
  sendAndUpload,
  generateOpenAiImage,
} from './utils.js';

export const main = () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  client.on('ready', () => {
    client.guilds.cache.map(async guild => {
      const dialogue = await fetchOpenAIDialogue({ openai });
      await createOpenAimp3({ openai, dialogue });
      await joinAndPlay({ guild });
      await sendAndUpload({ guild, dialogue });
      // too exppensive
      // await generateOpenAiImage({ openai, guild, dialogue });
    });
  });

  client.login(process.env.DISCORD_CLIENT_TOKEN).then(() =>
    setTimeout(() => {
      client.destroy();
      process.exit();
    }, 1000 * 10 * 6 * 10),
  );
};

main();
