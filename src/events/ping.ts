import { Message } from 'discord.js';

export const ping = (message : Message<boolean>, comand: string) => {
  if (message.content !== comand) return;

  const userTime = message.createdTimestamp;
  const serverTime = Date.now;

  message.reply(`Pong! ${serverTime() - userTime}ms`);
};
