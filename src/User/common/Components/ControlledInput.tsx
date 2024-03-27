import { Controller } from 'react-hook-form';
import { Input, InputProps } from '@flumens';

type Props = { control: any; name: string } & Partial<InputProps>;

const ControlledInput = ({ control, name, placeholder, ...props }: Props) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Input
        {...field}
        isInvalid={fieldState.invalid}
        errorMessage={fieldState.error?.message}
        platform="ios"
        placeholder={placeholder}
        {...props}
      />
    )}
  />
);

export default ControlledInput;
