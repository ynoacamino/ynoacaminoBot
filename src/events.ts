import { Message } from 'discord.js';
import { joinVoiceChannel } from '@discordjs/voice';
import { ping } from './events/ping';
import { play } from './events/play';
import { deleteAllFiles } from './utils';

export const events = async (message: Message<boolean>) => {
  ping(message, 'ynoa/ping');

  play(message, 'ynoa/play');

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
    deleteAllFiles();
  }
};
