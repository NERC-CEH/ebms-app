import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Input, InputProps } from '@flumens';

type Props = { control: any; name: string } & Partial<InputProps>;

const ControlledInput = ({ control, name, placeholder, ...props }: Props) => {
  const { t } = useTranslation();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          {...field}
          isInvalid={fieldState.invalid}
          errorMessage={
            fieldState.error?.message ? t(fieldState.error?.message) : undefined
          }
          platform="ios"
          placeholder={placeholder ? t(placeholder) : undefined}
          {...props}
        />
      )}
    />
  );
};

export default ControlledInput;
