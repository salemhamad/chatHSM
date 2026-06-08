/// <reference types="vinxi/types/server" />
import { getRouterManifest } from '@tanstack/start/router-manifest';
import { createRequestHandler, defaultStreamHandler } from '@tanstack/start/server';
import { createRouter } from './router';

export default async function handler(request: Request) {
  const handleRequest = createRequestHandler({
    createRouter,
    getRouterManifest,
    request,
  });
  return handleRequest(defaultStreamHandler);
}
