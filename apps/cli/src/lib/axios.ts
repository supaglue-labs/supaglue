import axios from 'axios';
import { distinctId } from './posthog';

export const axiosInstance = axios.create({ timeout: 5000, headers: { 'x-distinct-id': distinctId } });
