import { ReactNode } from 'react';
import getIcon from './companyToIcon';

export default function providerToIcon(providerName: string, size = 25): ReactNode {
  return getIcon(providerName, size);
}
