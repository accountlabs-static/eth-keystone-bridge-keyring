import { requestHandler as rabbyRequestHandler } from './rabby/request-handler';

window.addEventListener('message', rabbyRequestHandler);