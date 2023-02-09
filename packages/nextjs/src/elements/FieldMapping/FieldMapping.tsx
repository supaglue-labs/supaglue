/** @jsxImportSource @emotion/react */
import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync, useSalesforceIntegration } from '../../hooks/api';
import { DeveloperConfig, PostgresDestination, SyncConfig } from '../../lib/types';
import { Select, SelectElements } from '../../primitives';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

type Field = {
  name: string;
  value: string;
};

type FieldMapping = Record<string, string>;

const EmptyContent = ({ className, children }: { className?: string; children: ReactNode }) => {
  return (
    <p css={styles.emptyContentReason} className={className}>
      {children}
    </p>
  );
};

const FieldMappingInternal = ({ appearance, syncConfigName }: FieldMappingProps) => {
  const { customerId } = useSupaglueContext();
  const { data: integration, error, isLoading: isLoadingIntegration } = useSalesforceIntegration(customerId);

  const { data: developerConfig, isLoading: isLoadingDeveloperConfig } = useSWR<DeveloperConfig>({
    path: '/developer_config',
  });

  // TODO: Use conditional fetching syntax
  const { data: sync, isLoading: isLoadingSync } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfigName}`,
  });

  if (error) {
    return null;
  }

  if (isLoadingDeveloperConfig || isLoadingSync || isLoadingIntegration) {
    return <EmptyContent>Loading...</EmptyContent>;
  }

  if (!integration) {
    return <EmptyContent>Not connected to Salesforce. Please connect to Salesforce first.</EmptyContent>;
  }

  if (!sync) {
    return <EmptyContent>No sync found.</EmptyContent>;
  }

  if (!developerConfig?.syncConfigs?.length) {
    return <EmptyContent>No developer config found.</EmptyContent>;
  }

  const syncConfig = developerConfig.syncConfigs.find(({ name }) => name === syncConfigName);

  if (!syncConfig?.destination.schema.fields.length) {
    return <EmptyContent>No fields to map.</EmptyContent>;
  }

  return <FieldCollection appearance={appearance} key={syncConfigName} sync={sync} syncConfig={syncConfig} />;
};

type FieldCollectionProps = {
  appearance?: SupaglueAppearance & {
    elements?: FieldMappingElements;
  };
  syncConfig: SyncConfig;
  sync: {
    id: string;
    customerId: string;
    enabled: boolean;
    fieldMapping?: FieldMapping;
    name: string;
    syncConfigName: string;
  };
};

const FieldCollection = ({ appearance, syncConfig, sync }: FieldCollectionProps) => {
  const initialFieldMapping = syncConfig.destination.schema.fields.reduce<FieldMapping>((mapping, { name }) => {
    mapping[name] =
      sync.fieldMapping?.[name] ||
      syncConfig.defaultFieldMapping?.find((mapping) => mapping.name === name)?.field ||
      '';
    return mapping;
  }, {});
  const [fieldMapping, setFieldMapping] = useState<FieldMapping>(initialFieldMapping);

  const { apiUrl, customerId } = useSupaglueContext();

  const { data: fields, isLoading: isLoadingFields } = useSWR({
    path: `/fields?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  const { mutate } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });
  const { trigger: triggerUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync.id}`, updateSync);

  const { upsertKey } = (syncConfig.destination as PostgresDestination).config;

  const onUpdateField = async (field: Field) => {
    const updatedFieldMapping = {
      ...fieldMapping,
      [field.name]: field.value,
    };

    const result = await triggerUpdateSync({
      id: sync.id,
      fieldMapping: updatedFieldMapping,
    });

    if (result?.data) {
      // Update the cache and state
      mutate({ ...result.data });
      setFieldMapping(updatedFieldMapping);
    }
  };

  return (
    // TODO: write form primitives
    <form css={styles.form} className={classNames('sg-form', appearance?.elements?.form)}>
      <div css={styles.formHeaderRow} className={classNames('sg-formHeaderRow', appearance?.elements?.formHeaderRow)}>
        <div
          css={styles.formColumnHeader}
          className={classNames('sg-formColumnHeader', appearance?.elements?.formColumnHeader)}
        >
          Application fields
        </div>
        <div
          css={styles.formColumnHeader}
          className={classNames('sg-formColumnHeader', appearance?.elements?.formColumnHeader)}
        >
          Salesforce fields
        </div>
      </div>

      {syncConfig.destination.schema.fields.map(({ name }, idx) => {
        const label =
          syncConfig.destination.schema.fields.find(({ name: fieldName }) => fieldName === name)?.label ?? name;

        return (
          <div
            key={idx}
            css={styles.fieldWrapper}
            className={classNames('sg-fieldWrapper', appearance?.elements?.fieldWrapper)}
          >
            <p css={styles.fieldName} className={classNames('sg-fieldName', appearance?.elements?.fieldName)}>
              {label}
            </p>
            <Select
              className="sg-fieldDropdown"
              appearance={appearance}
              disabled={!!upsertKey && name === upsertKey}
              label="Salesforce field name"
              onValueChange={async (value: string) => {
                await onUpdateField({ name, value });
              }}
              options={fields ?? []}
              value={fieldMapping[name]}
              isLoading={isLoadingFields}
            />
          </div>
        );
      })}
    </form>
  );
};

export type FieldMappingElements = SelectElements & {
  fieldDropdownOption?: string;
  fieldMapperRow?: string;
  fieldName?: string;
  fieldWrapper?: string;
  form?: string;
  formColumnHeader?: string;
  formHeaderRow?: string;
};

export type FieldMappingProps = {
  appearance?: SupaglueAppearance & {
    elements?: FieldMappingElements;
  };
  syncConfigName: string;
};

export const FieldMapping = ({ appearance, syncConfigName }: FieldMappingProps) => (
  <SupaglueProviderInternal>
    <FieldMappingInternal appearance={appearance} syncConfigName={syncConfigName} />
  </SupaglueProviderInternal>
);
