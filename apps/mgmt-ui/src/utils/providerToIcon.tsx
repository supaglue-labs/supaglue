import { ReactNode } from 'react';
import companyToIcon from './companyToIcon';

export default function providerToIcon(providerName: string, size = 25): ReactNode {
  return companyToIcon(providerName, size);
}
