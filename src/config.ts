import path from 'node:path';

export const PATH = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'public');
