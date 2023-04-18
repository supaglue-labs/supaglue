/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Link from '@docusaurus/Link';
import { findFirstSidebarItemLink, useDocById } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import clsx from 'clsx';
import React, { type ReactNode } from 'react';

import type { PropSidebarItemCategory, PropSidebarItemLink } from '@docusaurus/plugin-content-docs';
import type { Props } from '@theme/DocCard';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

function CardContainer({ href, children }: { href: string; children: ReactNode }): JSX.Element {
  return (
    <Link href={href} className={clsx('card padding--lg', styles.cardContainer)}>
      {children}
    </Link>
  );
}

function getBadgeColor(category) {
  switch (category) {
    case 'CRM':
      return 'green';
    case 'Sales engagement':
      return 'navy';
    case 'Marketing automation':
      return 'orange';
    default:
      return 'gray';
  }
}

function CardLayout({
  href,
  icon,
  title,
  description,
  category,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
  category?: string;
}): JSX.Element {
  const badgeColor = category ? getBadgeColor(category) : 'gray';

  return (
    <CardContainer href={href}>
      <div className={styles.cardHeader}>
        <Heading as="h2" className={clsx(styles.cardTitle)} title={title}>
          {icon}&nbsp;&nbsp;&nbsp;{title}
        </Heading>
        {category && (
          <span className={clsx('badge', styles.cardLabel)} style={{ backgroundColor: badgeColor }}>
            {category}
          </span>
        )}
      </div>
      {description && (
        <p className={clsx('text--truncate', styles.cardDescription)} title={description}>
          {description}
        </p>
      )}
    </CardContainer>
  );
}

function CardCategory({ item }: { item: PropSidebarItemCategory }): JSX.Element | null {
  const href = findFirstSidebarItemLink(item);

  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }

  return (
    <CardLayout
      href={href}
      icon="🗃️"
      title={item.label}
      category={item.category}
      description={
        item.description ??
        translate(
          {
            message: '{count} items',
            id: 'theme.docs.DocCard.categoryDescription',
            description:
              'The default description for a category card in the generated index about how many items this category includes',
          },
          { count: item.items.length }
        )
      }
    />
  );
}

function CardLink({ item }: { item: PropSidebarItemLink }): JSX.Element {
  const icon: ReactNode = item.customProps ? (
    item.customProps.icon ? (
      <img src={item.customProps.icon} alt={`${item.label} icon`} width="20" height="20" />
    ) : null
  ) : null;
  const doc = useDocById(item.docId ?? undefined);
  const category = item.customProps ? item.customProps.category ?? undefined : null;
  return (
    <CardLayout
      href={item.href}
      icon={icon ? icon : '📄'}
      title={item.label}
      category={category}
      description={item.description ?? doc?.description}
    />
  );
}

export default function DocCard({ item }: Props): JSX.Element {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
