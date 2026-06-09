/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/start/router-manifest';
import { createRequestHandler, defaultStreamHandler } from '@tanstack/start/server';
import { createRouter } from './router';

const handler = createRequestHandler({
  createRouter,
  getRouterManifest,
});

export default handler(defaultStreamHandler);
