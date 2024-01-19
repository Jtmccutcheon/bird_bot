import fs from 'fs';
import path from 'path';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} from '@discordjs/voice';

const speechFile = path.resolve('./speech.mp3');

export const fetchOpenAIDialogue = async ({ openai }) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      max_tokens: 1000,
      messages: [
        {
          role: 'system',
          content:
            'imagine you are a human bird hyrbid race that thinks they are better than humanity and has the catch phrase get squawked and you always start your sentences with what are you squawkin about',
        },
        {
          role: 'user',
          content:
            'teach us some bird lore and tell us to get squawked but keep it short',
        },
      ],
    });
    console.log(completion);
    console.log(completion.choices[0]);
    return completion.choices[0].message.content;
  } catch (error) {
    console.log(error);
  }
};

export const createOpenAimp3 = async ({ openai, dialogue }) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'fable',
      input: dialogue,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());

    await fs.promises.writeFile(speechFile, buffer);
  } catch (error) {
    console.log(error);
  }
};

export const joinAndPlay = async ({ guild }) => {
  const voiceChannels = guild.channels.cache
    .map(c => c)
    .filter(i => i.type === 2);

  const highestMemberCount = Math.max(
    ...voiceChannels.map(vc => vc.members.map(member => member).length),
  );

  const voiceChannel = voiceChannels
    .map(vc => vc)
    .find(v => v.members.map(member => member).length === highestMemberCount);

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  const player = createAudioPlayer();
  const subscription = connection.subscribe(player);
  const resource = createAudioResource('./speech.mp3');
  setTimeout(() => {
    player.play(resource);
  }, 1000);

  if (subscription) {
    setTimeout(() => {
      subscription.unsubscribe();
      connection.disconnect();
    }, 1000 * 10 * 6 * 3);
  }
};

export const sendAndUpload = async ({ guild, dialogue }) =>
  await guild.channels
    .fetch()
    .then(channels => {
      const textChannels = channels.filter(channel => channel.type === 0);
      const textChannel = textChannels.find(
        textChannel => textChannel.name === 'bird-lords',
      );

      if (textChannel) {
        // this can fail if diagloue > 2000 characters
        textChannel.send(dialogue);
        setTimeout(() => {
          textChannel.send({
            files: [
              {
                attachment: './speech.mp3',
                name: 'bird.mp3',
                description: 'GET SQUAWKED',
              },
            ],
          });
        }, 1000 * 10 * 6);
      }
    })
    .catch(error => {
      console.log(error);
    });

export const generateOpenAiImage = async ({ openai, guild, dialogue }) => {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `draw a scene of a highly advanced humanoid bird race teaching humanity this bird lore: ${dialogue}`,
      n: 1,
      size: '1024x1024',
    });
    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;
    console.log({ revisedPrompt });
    await guild.channels
      .fetch()
      .then(channels => {
        const textChannels = channels.filter(channel => channel.type === 0);
        const textChannel = textChannels.find(
          textChannel => textChannel.name === 'bird-lords',
        );
        if (textChannel) {
          textChannel.send(imageUrl);
        }
      })
      .catch(error => {
        console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
};
