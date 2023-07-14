import type { TextFieldProps } from '@mui/material';
import { Button, Stack, TextField } from '@mui/material';
import { useState } from 'react';

export type KnownOrUnknownValue =
  | {
      type: 'known';
      value: string;
    }
  | {
      type: 'unknown';
    };

type ExistingPasswordTextFieldProps = Omit<TextFieldProps, 'value' | 'onChange'> & {
  value: KnownOrUnknownValue;
  onChange: (value: KnownOrUnknownValue) => void;
};

export const ExistingPasswordTextField = (props: ExistingPasswordTextFieldProps) => {
  const { value, onChange, ...rest } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [newPassword, setNewPassword] = useState<string>('');

  return (
    <Stack direction="row" className="gap-2">
      <TextField
        className="w-full"
        value={isEditing ? newPassword : value.type === 'known' ? value.value : '********'}
        disabled={value.type === 'unknown' && !isEditing}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          if (value.type === 'known') {
            onChange({ type: 'known', value: event.target.value });
          } else {
            setNewPassword(event.target.value);
          }
        }}
        {...rest}
      />
      {value.type === 'known' ? null : isEditing ? (
        <>
          <Button
            variant="outlined"
            onClick={() => {
              setIsEditing(false);
              setNewPassword('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setIsEditing(false);
              onChange({ type: 'known', value: newPassword });
              setNewPassword('');
            }}
          >
            Done
          </Button>
        </>
      ) : (
        <Button
          variant="outlined"
          onClick={() => {
            setIsEditing(true);
            setNewPassword('');
          }}
        >
          Edit
        </Button>
      )}
    </Stack>
  );
};
