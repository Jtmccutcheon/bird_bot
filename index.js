import fs from 'fs';
import path from 'path';
import { GatewayIntentBits, Client } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from '@discordjs/voice';
import OpenAI from 'openai';
import 'dotenv/config';

const speechFile = path.resolve('./speech.mp3');

const fetchOpenAIDialogue = async ({ openai }) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content:
            'imagine you are a bird human hyrbid race that thinks they are better than humanity',
        },
        {
          role: 'user',
          content: 'hit us with some friendly trash talk',
        },
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.log(error);
  }
};

const createOpenAimp3 = async ({ openai, birdDialogue }) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'fable',
      input: birdDialogue,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
  } catch (error) {
    console.log(error);
  }
};

const main = async () => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  client.on('ready', async () => {
    client.guilds.cache.map(async guild => {
      const birdDialogue = await fetchOpenAIDialogue({ openai });

      await createOpenAimp3({ openai, birdDialogue });

      const voiceChannel = await guild.channels.fetch(
        process.env.VOICE_CHANNEL_ID,
      );
      const connection = joinVoiceChannel({
        channelId: process.env.VOICE_CHANNEL_ID,
        guildId: process.env.SERVER_ID,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      const resource = createAudioResource('./speech.mp3');
      const subscription = connection.subscribe(player);
      player.play(resource);

      const textChannels = channels.filter(
        channel => channel.type === 'GUILD_TEXT',
      );

      const textChannel = textChannels.find(
        textChannel => textChannel.name === 'bird-lords',
      );

      if (subscription) {
        setTimeout(() => {
          textChannel.send(birdDialogue);
          subscription.unsubscribe();
          connection.disconnect();
        }, 1000 * 10 * 6 * 5);
      }
    });
  });

  client.login(process.env.DISCORD_CLIENT_TOKEN).then(() => {});
};

main();
