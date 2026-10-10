import type { Ref } from 'react';
import { type Control, type FieldPath, type FieldValues, useController } from 'react-hook-form';

import { Input, type InputProps, type TextInputRef } from '../primitives/Input';

export type FormTextFieldProps<T extends FieldValues> = Omit<
  InputProps,
  'value' | 'onChangeText' | 'onBlur' | 'error'
> & {
  control: Control<T>;
  name: FieldPath<T>;
  /** Maps a validation message (a translation key from the Zod schema) to display text. */
  translateError?: (message: string) => string;
  ref?: Ref<TextInputRef>;
};

/**
 * Text field bound to react-hook-form. Zod schemas put translation keys in their messages
 * (e.g. 'auth.validation.emailInvalid'), and `translateError` turns them into text.
 */
export function FormTextField<T extends FieldValues>({
  control,
  name,
  translateError = message => message,
  ref,
  ...inputProps
}: FormTextFieldProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <Input
      ref={ref}
      value={typeof field.value === 'string' ? field.value : ''}
      onChangeText={field.onChange}
      onBlur={field.onBlur}
      error={fieldState.error?.message ? translateError(fieldState.error.message) : undefined}
      {...inputProps}
    />
  );
}
