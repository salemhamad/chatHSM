/// <reference types="vinxi/types/client" />
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/start';
import { createRouter } from './router';

const router = createRouter();

export default function Client() {
  hydrateRoot(document, <StartClient router={router as any} />);
}
