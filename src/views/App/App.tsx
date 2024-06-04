import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { StatsigProvider } from 'statsig-react';

import { environment, isTest } from 'env';

import { useAnalytics } from 'analytics';
import { Loader, RoutesLoader, useAsyncEffect } from 'shared';

import { useAuth, useUser } from 'auth';

import routes from './routes';

import { Container } from './App.styles';

const App: React.FC<{}> = () => {
  const { anonymousId, identify } = useAnalytics();

  const { setAuth, setAuthLoading, authLoading } = useAuth();

  const user = useUser();

  const navigate = useNavigate();

  useAsyncEffect(async () => {
    try {
      const { data } = await Promise.resolve({
        data: {
          id: 'fixme',
          email: 'fixme',
          org_id: 'fixme',
        },
      });

      if (data) {
        setAuth(data);
      }
    } catch (_) {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user && !authLoading) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    identify(user);
  }, [identify, user]);

  return (
    <Container>
      <StatsigProvider
        sdkKey={import.meta.env.VITE_STATSIG_KEY}
        waitForInitialization={isTest ? false : true}
        initializingComponent={<Loader />}
        options={{
          // Checking for undefined because we don't allow loading segment in development
          overrideStableID: anonymousId ? `${anonymousId}` : undefined,
          environment: {
            tier: environment,
          },
          disableAutoMetricsLogging: true,
          disableCurrentPageLogging: true,
          disableDiagnosticsLogging: true,
          disableErrorLogging: true,
        }}
        user={{
          userID: user?.id,
          email: user?.email,
          customIDs: {
            ...(user && {
              orgID: user.org_id,
            }),
          },
        }}
      >
        {!authLoading && <RoutesLoader fallback={<Loader />} routes={routes} />}
      </StatsigProvider>
    </Container>
  );
};

export default App;
