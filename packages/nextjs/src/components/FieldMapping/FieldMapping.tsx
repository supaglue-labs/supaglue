import classNames from 'classnames';
import { useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { Select } from '..';
import { SupaglueApiProvider, updateSync, useSalesforceIntegration } from '../../hooks/api';
import { DeveloperConfig, PostgresDestination, SyncConfig } from '../../lib/types';
import { useSupaglueContext } from '../../provider';
import { SupaglueAppearance } from '../../types';
import styles from './FieldMapping.module.css';

type Field = {
  name: string;
  value: string;
};

type FieldMapping = Record<string, string>;

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
    return <p className={styles.emptyContentReason}>Loading...</p>;
  }

  if (!integration) {
    return (
      <p className={styles.emptyContentReason}>Not connected to Salesforce. Please connect to Salesforce first.</p>
    );
  }

  if (!sync) {
    return <p className={styles.emptyContentReason}>No sync found.</p>;
  }

  if (!developerConfig?.syncConfigs?.length) {
    return <p className={styles.emptyContentReason}>No developer config found.</p>;
  }

  const syncConfig = developerConfig.syncConfigs.find(({ name }) => name === syncConfigName);

  if (!syncConfig?.destination.schema.fields.length) {
    return <p className={styles.emptyContentReason}>No fields to map.</p>;
  }

  return <FieldCollection appearance={appearance} sync={sync} syncConfig={syncConfig} />;
};

type FieldCollectionProps = {
  appearance?: SupaglueAppearance & {
    elements?: Elements;
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
    <form className={classNames(appearance?.elements?.form, 'sg-form', styles.form)}>
      <div className={classNames(appearance?.elements?.formHeaderRow, 'sg-formHeaderRow', styles.formHeaderRow)}>
        <div
          className={classNames(appearance?.elements?.formColumnHeader, 'sg-formColumnHeader', styles.formColumnHeader)}
        >
          Application fields
        </div>
        <div
          className={classNames(appearance?.elements?.formColumnHeader, 'sg-formColumnHeader', styles.formColumnHeader)}
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
            className={classNames(appearance?.elements?.fieldWrapper, 'sg-fieldWrapper', styles.fieldWrapper)}
          >
            <p className={classNames(appearance?.elements?.fieldName, 'sg-fieldName', styles.fieldName)}>{label}</p>
            <Select
              className={classNames(appearance?.elements?.fieldDropdown, styles.fieldDropdown, 'sg-fieldDropdown')}
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

type Elements = {
  fieldDropdown?: string;
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
    elements?: Elements;
  };
  syncConfigName: string;
};

export const FieldMapping = ({ appearance, syncConfigName }: FieldMappingProps) => (
  <SupaglueApiProvider>
    <FieldMappingInternal appearance={appearance} syncConfigName={syncConfigName} />
  </SupaglueApiProvider>
);
