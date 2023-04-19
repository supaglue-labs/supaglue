import PostgresIcon from '@/assets/destination_icons/postgres.png';
import S3Icon from '@/assets/destination_icons/s3.png';
import Image from 'next/image';
import { ReactNode } from 'react';

export default function destinationTypeToIcon(type: string, size = 25): ReactNode {
  const destinationTypeToIconMap: Record<string, ReactNode> = {
    s3: <Image key={type} alt={type} src={S3Icon} width={size} height={size} />,
    postgres: <Image key={type} alt={type} src={PostgresIcon} width={size} height={size} />,
  };

  return destinationTypeToIconMap[type];
}
