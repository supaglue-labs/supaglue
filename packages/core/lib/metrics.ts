import { Histogram } from 'prom-client';

export const remoteDuration = new Histogram({
  name: 'remote_duration_seconds',
  help: 'remote operation duration in seconds',
  labelNames: ['operation', 'remote_name'],
});
