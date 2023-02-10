/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync, useSalesforceIntegration } from '../../hooks/api';
import {
  CustomerFieldMapping,
  DeveloperConfig,
  Field,
  PostgresDestination,
  SObjectField,
  SyncConfig,
  SyncUpdateParams,
} from '../../lib/types';
import { Select, SelectElements } from '../../primitives';
import { XIcon } from '../../primitives/icons';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

type MappedField = {
  name: string;
  value: string;
};

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
  appearance?: FieldMappingAppearance;
  syncConfig: SyncConfig;
  sync: {
    id: string;
    customerId: string;
    enabled: boolean;
    fieldMapping?: CustomerFieldMapping;
    name: string;
    syncConfigName: string;
    customProperties?: Field[];
  };
};

const FieldCollection = ({ appearance, syncConfig, sync }: FieldCollectionProps) => {
  const initialFieldMapping = syncConfig.destination.schema.fields.reduce<CustomerFieldMapping>((mapping, { name }) => {
    mapping[name] =
      sync.fieldMapping?.[name] ||
      syncConfig.defaultFieldMapping?.find((mapping) => mapping.name === name)?.field ||
      '';
    return mapping;
  }, {});
  const [fieldMapping, setFieldMapping] = useState<CustomerFieldMapping>(initialFieldMapping);

  const [isCreatingCustomProperty, setIsCreatingCustomProperty] = useState(false);

  const { apiUrl, customerId } = useSupaglueContext();

  const { data: fields, isLoading: isLoadingFields } = useSWR({
    path: `/fields?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  const { mutate } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });
  const { trigger: callUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync.id}`, updateSync);

  const { upsertKey } = (syncConfig.destination as PostgresDestination).config;

  const onUpdateSync = async (params: SyncUpdateParams, onSuccess?: () => void) => {
    const result = await callUpdateSync(params);

    if (result?.data) {
      // Update the cache and state
      mutate({ ...result.data });
      if (onSuccess) {
        onSuccess();
      }
    }
  };

  const onUpdateMappedField = async (field: MappedField) => {
    const updatedFieldMapping: CustomerFieldMapping = {
      ...fieldMapping,
      [field.name]: field.value,
    };

    await onUpdateSync(
      {
        id: sync.id,
        fieldMapping: updatedFieldMapping,
      },
      () => setFieldMapping(updatedFieldMapping)
    );
  };

  const applicationFields = [...syncConfig.destination.schema.fields, ...(sync.customProperties || [])];
  const customPropertyNames = new Set((sync.customProperties || []).map((field) => field.name));

  const onCreateCustomProperty = async (name: string) => {
    name = name.trim();

    // Prevent duplicate field names
    if (name === '' || applicationFields.map((field) => field.name).includes(name)) {
      // TODO: Show error
      return;
    }

    await onUpdateSync(
      {
        id: sync.id,
        customProperties: [...(sync.customProperties || []), { name, label: name }],
      },
      () => setIsCreatingCustomProperty(false)
    );
  };

  const onRemoveCustomProperty = async (name: string) => {
    const updatedFieldMapping: CustomerFieldMapping = { ...fieldMapping };
    delete fieldMapping[name];

    await onUpdateSync(
      {
        id: sync.id,
        customProperties: (sync.customProperties || []).filter((field) => field.name !== name),
        fieldMapping: updatedFieldMapping,
      },
      () => setFieldMapping(updatedFieldMapping)
    );
  };

  return (
    // TODO: write form primitives
    <div css={styles.form} className={classNames('sg-form', appearance?.elements?.form)}>
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

      {applicationFields.map(({ label, name }, idx) => (
        <div
          key={idx}
          css={styles.fieldWrapper}
          className={classNames(appearance?.elements?.fieldWrapper, 'sg-fieldWrapper')}
        >
          <p css={styles.fieldName} className={classNames('sg-fieldName', appearance?.elements?.fieldName)}>
            {label ?? name}
          </p>

          <Select
            appearance={appearance}
            disabled={!!upsertKey && name === upsertKey}
            label="Salesforce field name"
            onValueChange={async (value: string) => {
              await onUpdateMappedField({ name, value });
            }}
            options={fields ? fields.sort((a: SObjectField, b: SObjectField) => a.label.localeCompare(b.label)) : []}
            value={fieldMapping[name]}
            isLoading={isLoadingFields}
          />

          {customPropertyNames.has(name) && (
            <XIcon
              onClick={() => onRemoveCustomProperty(name)}
              css={css({ position: 'absolute', right: '-1.75rem' })}
            />
          )}
        </div>
      ))}

      {isCreatingCustomProperty && (
        <NewCustomPropertyForm
          appearance={appearance}
          onCancel={() => setIsCreatingCustomProperty(false)}
          onCreateCustomProperty={onCreateCustomProperty}
        />
      )}

      <AddCustomPropertyButton
        appearance={appearance}
        disabled={isCreatingCustomProperty}
        onClick={() => setIsCreatingCustomProperty(true)}
      />
    </div>
  );
};

const NewCustomPropertyForm = ({
  appearance,
  onCancel,
  onCreateCustomProperty,
}: {
  appearance?: FieldMappingAppearance;
  onCancel: () => void;
  onCreateCustomProperty: (name: string) => void;
}) => (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      // @ts-expect-error: Figure out how to type this
      onCreateCustomProperty(e.target[0].value);
    }}
    css={styles.fieldWrapper}
    className={classNames(appearance?.elements?.fieldWrapper, 'sg-fieldWrapper')}
  >
    <input
      css={styles.newCustomPropertyInput}
      className={classNames(appearance?.elements?.newCustomPropertyInput, 'sg-newCustomPropertyInput')}
      onBlur={(e) => onCreateCustomProperty(e.target.value)}
      defaultValue=""
      type="text"
    />
    <input css={styles.customPropertySubmitInput} type="submit" />
    <XIcon
      className={classNames(appearance?.elements?.deleteCustomPropertyButton, 'sg-deleteCustomPropertyButton')}
      onClick={onCancel}
      css={css({
        marginRight: 'auto',
      })}
    />
  </form>
);

const AddCustomPropertyButton = ({
  appearance,
  ...props
}: {
  appearance?: FieldMappingAppearance;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    className={classNames(appearance?.elements?.addCustomPropertyButton, 'sg-addCustomPropertyButton')}
    css={styles.addCustomPropertyButton}
    {...props}
    type={undefined}
  >
    + Add custom property
  </button>
);

export type FieldMappingElements = SelectElements & {
  addCustomPropertyButton?: string;
  deleteCustomPropertyButton?: string;
  fieldDropdownOption?: string;
  fieldMapperRow?: string;
  fieldName?: string;
  fieldWrapper?: string;
  form?: string;
  formColumnHeader?: string;
  formHeaderRow?: string;
  newCustomPropertyInput?: string;
};

type FieldMappingAppearance = SupaglueAppearance & {
  elements?: FieldMappingElements;
};

export type FieldMappingProps = {
  appearance?: FieldMappingAppearance;
  syncConfigName: string;
};

export const FieldMapping = ({ appearance, syncConfigName }: FieldMappingProps) => (
  <SupaglueProviderInternal>
    <FieldMappingInternal appearance={appearance} syncConfigName={syncConfigName} />
  </SupaglueProviderInternal>
);
