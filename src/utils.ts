import ytdl from 'ytdl-core';
import fs from 'node:fs';
import { YouTube as ytsr } from 'youtube-sr';
import { join } from 'node:path';
import { exec } from 'node:child_process';
import { PATH } from './config';

export const dowloadVideo = async (url: string, path: string) => {
  try {
    const info = await ytdl.getInfo(url, { lang: 'es' });

    const res = await new Promise((resolve, reject) => {
      exec(`yt-dlp ${url} -f "ba" -o ${path}`, (error, stdout) => {
        if (error) {
          console.error('Error al descargar el video', error);
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });

    return { ...info, path, res };
  } catch (error) {
    console.error('Error al descargar el video', error);
    throw new Error('Error al descargar el audio');
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
