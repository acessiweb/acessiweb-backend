import { readFileSync, existsSync } from 'fs';

const envFile = '.env.local';

if (existsSync(envFile)) {
  readFileSync(envFile, 'utf8')
    .split('\n')
    .filter((line) => line.trim() && !line.startsWith('#'))
    .forEach((line) => {
      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
      }
    });
}

export {};
