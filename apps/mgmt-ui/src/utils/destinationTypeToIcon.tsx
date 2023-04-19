import { ReactNode } from 'react';
import companyToIcon from './companyToIcon';

export default function destinationTypeToIcon(type: string, size = 25): ReactNode {
  return companyToIcon(type, size);
}
