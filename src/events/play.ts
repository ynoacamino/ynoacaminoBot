import { Message } from 'discord.js';
import {
  AudioPlayerStatus, createAudioPlayer, createAudioResource, joinVoiceChannel,
} from '@discordjs/voice';

import { join } from 'node:path';
import {
  deleteAllFiles,
  dowloadVideo, getUrl, isUrl,
} from '../utils';

import { PATH } from '../config';

export const play = async (message: Message<boolean>, comand: string) => {
  if (!message.content.startsWith(comand)) return;

  let linkVideo = message.content.slice(10);

  if (!isUrl(linkVideo)) {
    message.reply(`Buscando:"${linkVideo}" en youtube`);
    linkVideo = await getUrl(linkVideo);
  }

  const voiceChannel = message.member?.voice.channel;

  if (!voiceChannel) {
    message.reply('Tienes que estar en un canal de voz para escuchar música');
    return;
  }

  deleteAllFiles();

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
  });

  let videoTitle = '';
  let video = null;

  const songname = `${crypto.randomUUID()}.m4a`;

  try {
    video = await dowloadVideo(linkVideo, join(PATH, songname));
    videoTitle = video.videoDetails.title;
  } catch (e) {
    message.reply((e as Error).message);
    return;
  }
  const audioPlayer = createAudioPlayer();

  const audioResource = createAudioResource(video.path);

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

    deleteAllFiles();
    connection.destroy();
  });

  audioPlayer.on(AudioPlayerStatus.Paused, () => {
    console.log('Audio pausado', (new Date()).toISOString());
    deleteAllFiles();
    connection.destroy();
  });
};
