/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  CustomerFieldMapping,
  Field,
  PostgresDestination,
  Schema,
  Sync,
  SyncConfig,
  SyncUpdateParams,
} from '@supaglue/types';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync, useSalesforceIntegration } from '../../hooks/api';
import { Select, SelectElements, SelectOption } from '../../primitives';
import { XIcon } from '../../primitives/icons';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

const getSchema = (syncConfig: SyncConfig): Schema => {
  if (syncConfig.type === 'outbound') {
    return syncConfig.source.schema;
  }
  return syncConfig.destination.schema;
};

const customPropertiesEnabled = (syncConfig: SyncConfig): boolean => {
  if (syncConfig.type === 'outbound') {
    return !!syncConfig.source.config.customPropertiesColumn;
  }
  return syncConfig.destination.type === 'postgres' && !!syncConfig.destination.config.customPropertiesColumn;
};

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

const FieldMappingInternal = ({ appearance, syncConfig }: FieldMappingProps) => {
  const { customerId } = useSupaglueContext();
  const { data: integration, error, isLoading: isLoadingIntegration } = useSalesforceIntegration(customerId);

  // TODO: Use conditional fetching syntax
  const { data: sync, isLoading: isLoadingSync } = useSWR<Sync>({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  if (error) {
    return null;
  }

  if (isLoadingSync || isLoadingIntegration) {
    return <EmptyContent>Loading...</EmptyContent>;
  }

  if (!integration) {
    return <EmptyContent>Not connected to Salesforce. Please connect to Salesforce first.</EmptyContent>;
  }

  if (!sync) {
    return <EmptyContent>No sync found.</EmptyContent>;
  }

  if (!getSchema(syncConfig)) {
    return <EmptyContent>No fields to map.</EmptyContent>;
  }

  return <FieldCollection appearance={appearance} key={syncConfig.name} sync={sync} syncConfig={syncConfig} />;
};

type FieldCollectionProps = {
  appearance?: FieldMappingAppearance;
  syncConfig: SyncConfig;
  sync: Sync;
};

const FieldCollection = ({ appearance, syncConfig, sync }: FieldCollectionProps) => {
  const schema = getSchema(syncConfig);

  // Use the customer-defined field mapping if it exists; default to the values supplied by the developer
  const initialFieldMapping: CustomerFieldMapping = {};
  (syncConfig.defaultFieldMapping || []).map(({ name, field }) => {
    initialFieldMapping[name] = field;
  });

  if (sync.fieldMapping) {
    Object.keys(sync.fieldMapping).map((key) => {
      if (sync.fieldMapping?.[key]) {
        initialFieldMapping[key] = sync.fieldMapping[key];
      }
    });
  }

  const [fieldMapping, setFieldMapping] = useState<CustomerFieldMapping>(initialFieldMapping);

  const [isCreatingCustomProperty, setIsCreatingCustomProperty] = useState(false);

  const { apiUrl, customerId } = useSupaglueContext();

  const { data: fields, isLoading: isLoadingFields } = useSWR<Field[]>({
    path: `/fields?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  const { mutate } = useSWR({
    path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });
  const { trigger: callUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync.id}`, updateSync);

  const { upsertKey } = (syncConfig.destination as PostgresDestination).config;

  const onUpdateSync = async (id: string, params: SyncUpdateParams, onSuccess?: () => void) => {
    const result = await callUpdateSync(params);

    if (result?.data) {
      // Update the cache and state
      await mutate({ ...result.data });
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
      sync.id,
      {
        type: syncConfig.type,
        fieldMapping: updatedFieldMapping,
      },
      () => setFieldMapping(updatedFieldMapping)
    );
  };

  const applicationFields = [...schema.fields, ...(sync.customProperties || [])];
  const customPropertyNames = new Set((sync.customProperties || []).map((field) => field.name));

  const onCreateCustomProperty = async (name: string) => {
    name = name.trim();

    // Prevent duplicate field names
    if (name === '' || applicationFields.map((field) => field.name).includes(name)) {
      setIsCreatingCustomProperty(false);
      // TODO: Show error
      return;
    }

    await onUpdateSync(
      sync.id,
      {
        type: syncConfig.type,
        customProperties: [...(sync.customProperties || []), { name, label: name }] as unknown as Field[],
      },
      () => setIsCreatingCustomProperty(false)
    );
  };

  const onRemoveCustomProperty = async (name: string) => {
    const updatedFieldMapping: CustomerFieldMapping = { ...fieldMapping };
    delete updatedFieldMapping[name];

    await onUpdateSync(
      sync.id,
      {
        type: syncConfig.type,
        customProperties: (sync.customProperties || []).filter((field) => field.name !== name) as unknown as Field[],
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

          <span>»</span>

          <Select
            appearance={appearance}
            disabled={!!upsertKey && name === upsertKey}
            label="Salesforce field name"
            onValueChange={async (value: string) => {
              await onUpdateMappedField({ name, value });
            }}
            options={fields ?? []}
            value={fieldMapping[name]}
            isLoading={isLoadingFields}
          />

          {customPropertyNames.has(name) && (
            <XIcon
              onClick={async () => await onRemoveCustomProperty(name)}
              css={css({ position: 'absolute', right: '-1.75rem' })}
            />
          )}
        </div>
      ))}

      {isCreatingCustomProperty && (
        <NewCustomPropertyForm
          appearance={appearance}
          onCreateCustomProperty={onCreateCustomProperty}
          onRemoveCustomProperty={onRemoveCustomProperty}
          onUpdateMappedField={onUpdateMappedField}
          options={fields || []}
        />
      )}

      {/* TODO: Add flag to enable/disable custom properties
      For now, just check to see if there's a column configured for custom properties */}
      {customPropertiesEnabled(syncConfig) && (
        <AddCustomPropertyButton
          appearance={appearance}
          disabled={isCreatingCustomProperty}
          onClick={() => setIsCreatingCustomProperty(true)}
        />
      )}
    </div>
  );
};

const NewCustomPropertyForm = ({
  appearance,
  onCreateCustomProperty,
  onRemoveCustomProperty,
  onUpdateMappedField,
  options,
}: {
  appearance?: FieldMappingAppearance;
  onCreateCustomProperty: (name: string) => void;
  onUpdateMappedField: (field: MappedField) => Promise<void>;
  onRemoveCustomProperty: (name: string) => void;
  options: SelectOption[];
}) => {
  const [customPropertyName, setCustomPropertyName] = useState('');

  // TODO: Refactor into subcomponent
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onCreateCustomProperty(customPropertyName);
      }}
      css={styles.fieldWrapper}
      className={classNames(appearance?.elements?.fieldWrapper, 'sg-fieldWrapper')}
    >
      <input
        css={styles.newCustomPropertyInput}
        className={classNames(appearance?.elements?.newCustomPropertyInput, 'sg-newCustomPropertyInput')}
        onBlur={(e) => onCreateCustomProperty(e.target.value)}
        onChange={(e) => setCustomPropertyName(e.target.value)}
        type="text"
        value={customPropertyName}
      />
      <input css={styles.customPropertySubmitInput} type="submit" />

      <span>»</span>

      {/* TODO: Allow selecting the field before naming the custom property */}
      <Select
        appearance={appearance}
        disabled
        label="Salesforce field name"
        onValueChange={async (value: string) => {
          await onUpdateMappedField({ name: customPropertyName, value });
        }}
        options={options}
        value=""
      />

      <XIcon
        onClick={async () => await onRemoveCustomProperty(customPropertyName)}
        css={css({ position: 'absolute', right: '-1.75rem' })}
      />
    </form>
  );
};

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
    + Field
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
  syncConfig: SyncConfig;
};

export const FieldMapping = ({ appearance, syncConfig }: FieldMappingProps) => (
  <SupaglueProviderInternal>
    <FieldMappingInternal appearance={appearance} syncConfig={syncConfig} />
  </SupaglueProviderInternal>
);
