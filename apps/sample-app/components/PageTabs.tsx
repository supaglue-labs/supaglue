import classNames from 'classnames';
import { useRouter } from 'next/router';
import { FC, HTMLAttributes, ReactNode, useEffect, useState } from 'react';
import { overrideTailwindClasses } from 'tailwind-override';
import { useActiveTab } from '../hooks';

export type Tab = {
  name: string;
  label: ReactNode;
};

export interface PageTabsProps extends HTMLAttributes<HTMLDivElement> {
  tabs: Tab[];
  disabled: boolean;
}

export const PageTabs: FC<PageTabsProps> = ({ tabs, disabled, className }: PageTabsProps) => {
  const tabName = useActiveTab(tabs[0].name);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>(tabName);

  useEffect(() => {
    setActiveTab(tabName);
  }, [tabName]);

  const onSelectTab = (tab: string) => {
    setActiveTab(tab);
    void router.push({ hash: tab });
  };

  return (
    <div className={overrideTailwindClasses(classNames(className, 'flex items-center justify-between'))}>
      <nav className="-mb-px flex" aria-label="Tabs">
        {tabs.map((tab: Tab) => (
          <PageTab
            key={tab.name}
            tab={tab}
            href={`#${tab}`}
            disabled={disabled}
            isActiveTab={tab.name === activeTab}
            setActiveTab={onSelectTab}
          />
        ))}
      </nav>
    </div>
  );
};

interface PageTabProps {
  tab: Tab;
  href: string;
  disabled?: boolean;
  isActiveTab: boolean;
  setActiveTab: (activeTab: string) => void;
}

export const PageTab: FC<PageTabProps> = ({ tab, href, disabled = false, isActiveTab, setActiveTab }: PageTabProps) => {
  if (disabled) {
    return (
      <div className="tabs" aria-current={isActiveTab ? 'page' : undefined}>
        {tab.label}
      </div>
    );
  }
  return (
    <a
      href={href}
      onClick={() => setActiveTab(tab.name)}
      className={classNames('tab tab-bordered px-6', {
        'tab-active': isActiveTab,
      })}
      aria-current={isActiveTab ? 'page' : undefined}
    >
      {tab.label}
    </a>
  );
};
