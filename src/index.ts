import { Client, Events } from 'discord.js';

import { PATH } from './config';
import { events } from './events';

import 'dotenv/config';

console.log('Ruta:', PATH);

const client = new Client({
  intents: 3276799,
});

client.on(Events.ClientReady, async () => {
  console.log('Conectado ');
});

client.on(Events.MessageCreate, events);

client.login(process.env.DISCORD_TOKEN);
