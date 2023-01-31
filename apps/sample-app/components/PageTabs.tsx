import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FC, HTMLAttributes, useEffect, useState } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';
import { useActiveTab } from '../hooks';

export interface PageTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: string[];
  disabled: boolean;
}

export const PageTabs: FC<PageTabsProps> = ({ tabs, disabled, className }: PageTabsProps) => {
  const tab = useActiveTab(tabs[0]);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>(tab);

  useEffect(() => {
    setActiveTab(tab);
  }, [tab]);

  const onSelectTab = (tab: string) => {
    setActiveTab(tab);
    router.push({ hash: tab });
  };

  return (
    <div className={overrideTailwindClasses(classNames(className, 'flex items-center justify-between'))}>
      <nav className="-mb-px flex" aria-label="Tabs">
        {tabs.map((tab: string) => (
          <PageTab
            key={tab}
            tab={tab}
            href={`#${tab}`}
            disabled={disabled}
            isActiveTab={tab === activeTab}
            setActiveTab={onSelectTab}
          />
        ))}
      </nav>
    </div>
  );
};

interface PageTabProps {
  tab: string;
  href: string;
  disabled?: boolean;
  isActiveTab: boolean;
  setActiveTab: (activeTab: string) => void;
}

export const PageTab: FC<PageTabProps> = ({ tab, href, disabled = false, isActiveTab, setActiveTab }: PageTabProps) => {
  if (disabled) {
    return (
      <div className="tabs" aria-current={isActiveTab ? 'page' : undefined}>
        {tab}
      </div>
    );
  }
  return (
    <a
      href={href}
      onClick={() => setActiveTab(tab)}
      className={classNames('tab tab-bordered px-6', {
        'tab-active': isActiveTab,
      })}
      aria-current={isActiveTab ? 'page' : undefined}
    >
      {tab}
    </a>
  );
};
