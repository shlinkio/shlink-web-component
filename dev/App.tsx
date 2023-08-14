import type { FC } from 'react';
import { ShlinkWebComponent } from '../src';
import { ShlinkApiClient } from './api/ShlinkApiClient';

export const App: FC = () => (
  <ShlinkWebComponent
    serverVersion="3.6.2"
    apiClient={new ShlinkApiClient('https://acel.me', '')}
    settings={{}}
  />
);
