import { Client, Events } from 'discord.js';
import {
  AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel,
} from '@discordjs/voice';
import ytdl from 'ytdl-core';
import { v4 as uuidv4 } from 'uuid';

import fs from 'node:fs';
import path from 'node:path';

import 'dotenv/config';

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

  if (message.content.startsWith('ynoa ')) {
    const linkVideo = message.content.slice(5);

    if (!linkVideo.startsWith('https://www.youtube.com/watch?v=')) {
      message.reply('El link no es valido');
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

    const writeAudio = ytdl(linkVideo, {
      filter: 'audioonly',
      quality: 'highestaudio',
    }).pipe(fs.createWriteStream(route));

    const audioDownload = await new Promise((resolve, reject) => {
      writeAudio.on('finish', () => {
        console.log('Descarga finalizada');
        resolve('succes');
      });

      writeAudio.on('error', (error) => {
        console.error(error);
        reject();
      });
    });

    if (audioDownload !== 'succes') {
      message.reply('Hubo un error al descargar el audio');
      return;
    }

    const audioResource = createAudioResource(route, {
      metadata: {
        title: 'Audio de prueba',
      },
    });

    const audioPlayer = createAudioPlayer();

    audioPlayer.play(audioResource);

    connection.subscribe(audioPlayer);

    audioPlayer.on('error', (error) => {
      console.error(error, (new Date()).toISOString());
    });

    audioPlayer.on(AudioPlayerStatus.Playing, () => {
      console.log('Reproduciendo audio', (new Date()).toISOString());
    });

    audioPlayer.on(AudioPlayerStatus.Idle, () => {
      console.log('Audio terminado', (new Date()).toISOString());
      connection.destroy();
    });

    audioPlayer.on(AudioPlayerStatus.Paused, () => {
      console.log('Audio pausado', (new Date()).toISOString());
    });

    audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
      console.log('Audio pausado automáticamente', (new Date()).toISOString());
    });

    message.reply(`Tocando a música: ${musicName}`);
  }

  if (message.content === 'stop') {
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
