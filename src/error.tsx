import { captureException, init, withScope } from '@sentry/browser';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

import { environment, isProduction, product, service, version } from 'env';

import { ErrorCard } from 'shared';

const isErrorTrackingEnabled =
  isProduction && !!import.meta.env.VITE_SENTRY_DSN;
const tunnelHost = import.meta.env.VITE_SENTRY_HOST;

if (isErrorTrackingEnabled) {
  init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: `${product}-${service}@${version}`,
    environment,
    tunnel: tunnelHost ? `https://${tunnelHost}` : undefined,
  });
}

export const errorCapture = (
  error: Error,
  context?: Record<string, unknown>,
) => {
  if (isErrorTrackingEnabled) {
    withScope((scope) => {
      scope.setContext('error', { message: error.message, ...context });
      captureException(error);
    });
  } else {
    console.error(error, context);
  }
};

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactErrorBoundary fallbackRender={ErrorCard}>
      {children}
    </ReactErrorBoundary>
  );
};
