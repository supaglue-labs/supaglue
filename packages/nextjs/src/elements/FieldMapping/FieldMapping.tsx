/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  CustomerFieldMapping,
  customPropertiesEnabled,
  Field,
  getSchema,
  getUpsertKey,
  Sync,
  SyncConfig,
  SyncUpdateParams,
} from '@supaglue/types';
import classNames from 'classnames';
import { ReactNode, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { updateSync, useSalesforceIntegration } from '../../hooks/api';
import { Select, SelectElements } from '../../primitives';
import { XIcon } from '../../primitives/icons';
import { SupaglueProviderInternal } from '../../providers';
import { useSupaglueContext } from '../../providers/SupaglueProvider';
import { SupaglueAppearance } from '../../types';
import styles from './styles';

const CUSTOM_PROPERTY_PLACEHOLDER_NAME = '';

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
  (schema.fields || []).map(({ name }) => {
    initialFieldMapping[name] = syncConfig.defaultFieldMapping?.find((field) => field.name === name)?.field || '';
  });

  if (sync.fieldMapping) {
    Object.keys(sync.fieldMapping).map((key) => {
      if (sync.fieldMapping?.[key]) {
        initialFieldMapping[key] = sync.fieldMapping[key];
      }
    });
  }

  const [fieldMapping, setFieldMapping] = useState<CustomerFieldMapping>(initialFieldMapping);

  const { apiUrl, customerId } = useSupaglueContext();

  const { trigger: callUpdateSync } = useSWRMutation(`${apiUrl}/syncs/${sync.id}`, updateSync);
  const { mutate } = useSWRConfig();

  const onUpdateSync = async (id: string, params: SyncUpdateParams) => {
    await callUpdateSync(params);

    // Force a refetch of the sync object
    await mutate({ path: `/syncs?customerId=${customerId}&syncConfigName=${syncConfig.name}` });
  };

  const onSelectSalesforceField = async (field: MappedField) => {
    const updatedFieldMapping = {
      ...fieldMapping,
      [field.name]: field.value,
    };

    setFieldMapping(updatedFieldMapping);

    if (field.name !== CUSTOM_PROPERTY_PLACEHOLDER_NAME) {
      await onUpdateSync(sync.id, { type: syncConfig.type, fieldMapping: updatedFieldMapping });
    }
  };

  const onCreateCustomProperty = async (name: string) => {
    name = name.trim();

    // Prevent duplicate and empty field names
    if (name === '' || Object.keys(fieldMapping).find((field) => field === name)) {
      // TODO: Show error
      return;
    }

    const updatedFieldMapping = {
      ...fieldMapping,
      [name]: fieldMapping[CUSTOM_PROPERTY_PLACEHOLDER_NAME],
    };
    delete updatedFieldMapping[CUSTOM_PROPERTY_PLACEHOLDER_NAME];
    setFieldMapping(updatedFieldMapping);

    await onUpdateSync(sync.id, {
      type: syncConfig.type,
      customProperties: [...(sync.customProperties || []), { name, label: name }] as unknown as Field[],
      fieldMapping: updatedFieldMapping,
    });
  };

  const onRemoveCustomProperty = async (propertyName: string) => {
    const updatedFieldMapping: CustomerFieldMapping = { ...fieldMapping };
    delete updatedFieldMapping[propertyName];

    setFieldMapping(updatedFieldMapping);

    await onUpdateSync(sync.id, {
      type: syncConfig.type,
      customProperties: (sync.customProperties || []).filter(
        (field) => field.name !== propertyName
      ) as unknown as Field[],
      fieldMapping: updatedFieldMapping,
    });
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

      {Object.keys(fieldMapping).map((fieldName, idx) => {
        const isCustomProperty = !schema.fields.find((normalizedField) => normalizedField.name == fieldName);
        const label =
          (isCustomProperty ? (sync.customProperties as unknown as Field[]) : schema.fields)?.find(
            (field: Field) => field.name === fieldName
          )?.label || fieldName;

        return (
          <MappedFieldRow
            key={idx}
            appearance={appearance}
            field={{ name: fieldName, label }}
            value={fieldMapping[fieldName]}
            isCustom={isCustomProperty}
            onCreateCustomProperty={onCreateCustomProperty}
            onRemoveCustomProperty={onRemoveCustomProperty}
            onSelectField={onSelectSalesforceField}
            syncConfig={syncConfig}
          />
        );
      })}

      {customPropertiesEnabled(syncConfig) && (
        <AddCustomPropertyButton
          appearance={appearance}
          disabled={Object.keys(fieldMapping).includes(CUSTOM_PROPERTY_PLACEHOLDER_NAME)}
          onClick={() => {
            setFieldMapping((fieldMapping) => ({
              ...fieldMapping,
              [CUSTOM_PROPERTY_PLACEHOLDER_NAME]: '',
            }));
          }}
        />
      )}
    </div>
  );
};

type MappedFieldRowProps = {
  appearance?: FieldMappingAppearance;
  field: Field;
  isCustom: boolean;
  onCreateCustomProperty: (name: string) => Promise<void>;
  onRemoveCustomProperty: (name: string) => Promise<void>;
  onSelectField: (field: MappedField) => Promise<void>;
  syncConfig: SyncConfig;
  value: string;
};

const MappedFieldRow = ({
  appearance,
  field,
  isCustom,
  onCreateCustomProperty,
  onRemoveCustomProperty,
  onSelectField,
  syncConfig,
  value = '',
}: MappedFieldRowProps) => {
  const upsertKey = getUpsertKey(syncConfig);
  const [customPropertyName, setCustomPropertyName] = useState('');

  const { customerId } = useSupaglueContext();

  const { data: fields, isLoading: isLoadingFields } = useSWR<Field[]>({
    path: `/fields?customerId=${customerId}&syncConfigName=${syncConfig.name}`,
  });

  return (
    <div css={styles.fieldWrapper} className={classNames(appearance?.elements?.fieldWrapper, 'sg-fieldWrapper')}>
      {field.name === CUSTOM_PROPERTY_PLACEHOLDER_NAME ? (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await onCreateCustomProperty(customPropertyName);
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
        </form>
      ) : (
        <p css={styles.fieldName} className={classNames('sg-fieldName', appearance?.elements?.fieldName)}>
          {field.label ?? field.name}
        </p>
      )}

      <span>»</span>

      <Select
        appearance={appearance}
        disabled={!!upsertKey && field.name === upsertKey}
        label="Salesforce field name"
        onValueChange={async (value: string) => await onSelectField({ name: field.name, value })}
        options={fields ?? []}
        value={value}
        isLoading={isLoadingFields}
      />

      {isCustom && (
        <XIcon
          onClick={async () => await onRemoveCustomProperty(field.name)}
          css={css({ position: 'absolute', right: '-1.75rem' })}
        />
      )}
    </div>
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
