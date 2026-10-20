import serverless from 'serverless-http';

type NetlifyEvent = {
  path?: string;
  rawUrl?: string;
  [key: string]: unknown;
};

type ExpressLambdaHandler = (event: any, context: any) => Promise<any>;
let expressHandler: ExpressLambdaHandler | undefined;

// Import the Express app lazily after setting the serverless flag. This prevents
// server.ts from opening a listening port inside the Netlify Function runtime.
export const handler = async (event: NetlifyEvent, context: unknown) => {
  process.env.DEEPFAKE_SERVERLESS = 'true';
  if (!expressHandler) {
    const { app } = await import('../../server.js');
    expressHandler = serverless(app) as ExpressLambdaHandler;
  }

  // Netlify's rewrite can expose either the original /api/... path or the
  // internal /.netlify/functions/api/api/... path depending on deploy mode.
  const functionPrefix = '/.netlify/functions/api';
  const currentPath = typeof event.path === 'string'
    ? event.path
    : (typeof event.rawUrl === 'string' ? new URL(event.rawUrl).pathname : '/');
  const normalizedPath = currentPath.startsWith(`${functionPrefix}/`)
    ? currentPath.slice(functionPrefix.length)
    : currentPath;

  return expressHandler({ ...event, path: normalizedPath } as any, context as any);
};
