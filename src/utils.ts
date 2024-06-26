import ytdl from 'ytdl-core';
import fs from 'node:fs';
import { YouTube as ytsr } from 'youtube-sr';
import { join } from 'node:path';
import { PATH } from './config';

export const dowloadVideo = async (url: string, path: string) => {
  const writeAudio = ytdl(url, {
    filter: 'audioonly',
    quality: 'highestaudio',
  }).pipe(fs.createWriteStream(path));

  try {
    const info = await ytdl.getInfo(url, { lang: 'es' });
    await new Promise((resolve, reject) => {
      writeAudio.on('finish', () => {
        console.log('Descarga finalizada');
        resolve('succes');
      });

      writeAudio.on('error', (error) => {
        console.error(error.message);
        reject();
      });
    });

    console.log(fs.readdirSync(join(process.cwd(), 'public')));

    return { ...info, path };
  } catch (error) {
    throw new Error('Error al descargar el audip');
  }
};

export const isUrl = (url: string) => {
  const urlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
  return urlRegex.test(url);
};

export const deleteFile = (path: string) => {
  fs.unlink(path, (err) => {
    if (err) {
      console.error('Error al eliminar el archivo', err);
    }
    console.log('Archivo eliminado');
  });
};

export const getUrl = async (query: string) => {
  const video = await ytsr.searchOne(query);

  return video.url;
};

export const deleteAllFiles = () => {
  fs.readdirSync(PATH).forEach((file) => {
    fs.unlinkSync(join(PATH, file));
  });
};
