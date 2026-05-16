import { createServer } from '../server';

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  if (!cachedApp) {
    cachedApp = await createServer();
  }
  return cachedApp(req, res);
}
