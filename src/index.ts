import { Client, Events } from 'discord.js';
import {
  AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel,
} from '@discordjs/voice';
import { v4 as uuidv4 } from 'uuid';

import path from 'node:path';

import 'dotenv/config';
import {
  deleteFile, dowloadVideo, getUrl, isUrl,
} from './utils';

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log('Conectado ');
});

client.on(Events.MessageCreate, async (message) => {
  if (message.content === 'ping') {
    const userTime = message.createdTimestamp;
    const serverTime = Date.now;

    message.reply(`Pong! ${serverTime() - userTime}ms`);
  }

  if (message.content.startsWith('ynoa/play ')) {
    let linkVideo = message.content.slice(10);

    if (!isUrl(linkVideo)) {
      message.reply(`Buscando:"${linkVideo}" en youtube`);
      linkVideo = await getUrl(linkVideo);
      return;
    }

    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) {
      message.reply('Tienes que estar en un canal de voz para escuchar música');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const musicName = `${uuidv4()}.mp3`;

    const route = path.join(process.cwd(), 'public', musicName);

    let videoTitle = '';

    try {
      const video = await dowloadVideo(linkVideo, route);
      videoTitle = video.videoDetails.title;
    } catch (e) {
      message.reply((e as Error).message);
      return;
    }

    const audioPlayer = createAudioPlayer();

    const audioResource = createAudioResource(route);

    audioPlayer.play(audioResource);

    connection.subscribe(audioPlayer);

    audioPlayer.on('error', (error) => {
      console.error(error, (new Date()).toISOString());
    });

    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      console.log('Reproduciendo audio', (new Date()).toISOString());

      message.reply(`Tocando a música: ${videoTitle}`);
    });

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      console.log('Audio terminado', (new Date()).toISOString());

      deleteFile(route);
      connection.destroy();
    });
  }

  if (message.content === 'ynoa/stop') {
    const voiceChannel = message.member?.voice.channel;

    if (!voiceChannel) {
      message.reply('Tienes que estar en un canal de voz para escuchar música');
      return;
    }

    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    connection.destroy();

    message.reply('Se ha detenido la música');
  }
});

client.login(process.env.DISCORD_TOKEN);
