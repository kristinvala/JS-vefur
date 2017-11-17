import express from 'express';
import compression from 'compression';
import { resolve as pathResolve } from 'path';
import appRootDir from 'app-root-dir';

// the webpack config aliases the SSR-appropriate react app in the
// reactApplication directory
import reactApplication from 'reactApplication';
import config from 'utils/config';

import security from './middleware/security';
import clientBundle from './middleware/clientBundle';
import serviceWorker from './middleware/serviceWorker';
import offlinePage from './middleware/offlinePage';
import errorHandlers from './middleware/errorHandlers';
import enforceHttps from './middleware/enforceHttps';
import basicAuth from './middleware/basicAuth';
import { log } from '../internal/utils';

// Create our express based server.
const app = express();

// Don't expose any software information to potential hackers.
app.disable('x-powered-by');

// Security middlewares.
app.use(...security);

// Gzip compress the responses.
app.use(compression());

// Register our service worker generated by our webpack config.
// We do not want the service worker registered for development builds, and
// additionally only want it registered if the config allows.
if (process.env.BUILD_FLAG_IS_DEV === 'false' && config('serviceWorker.enabled')) {
  app.get(`/${config('serviceWorker.fileName')}`, serviceWorker);
  app.get(
    `${config('bundles.client.webPath')}${config('serviceWorker.offlinePageFileName')}`,
    offlinePage,
  );
}

// Proxy hot module reload development server when flagged to do so.
if (process.env.BUILD_FLAG_IS_DEV === 'true' && config('clientDevProxy')) {
  app.use(require('./middleware/devServerProxy').default);
}

if (process.env.BUILD_FLAG_IS_DEV === 'false' && config('enforceHttps')) {
  app.use(enforceHttps);
}

// Configure serving of our client bundle.
app.use(config('bundles.client.webPath'), clientBundle);

// Configure static serving of our "public" root http path static files.
// Note: these will be served off the root (i.e. '/') of our application.
app.use(express.static(pathResolve(appRootDir.get(), config('publicAssetsPath'))));

if (config('passwordProtect') !== '') {
  app.use(basicAuth);
}

// The React application middleware.
app.get('*', (request, response) => {
  log({
    title: 'Request',
    level: 'special',
    message: `Received for "${request.url}"`,
  });

  return reactApplication(request, response);
});

// Error Handler middlewares.
app.use(...errorHandlers);

// Create an http listener for our express app.
const listener = app.listen(config('port'), () => {
  const host = config('host');
  const port = config('port');
  const localUrl = `http://${host}:${port}`;
  const publicUrl = process.env.PUBLIC_URL;
  const url = publicUrl && publicUrl !== '' ? publicUrl : localUrl;

  log({
    title: 'server',
    level: 'special',
    message: `Server started on port ${port}
Available on ${url}
Press Ctrl-C to stop.`,
  });
});

// We export the listener as it will be handy for our development hot reloader,
// or for exposing a general extension layer for application customisations.
export default listener;
