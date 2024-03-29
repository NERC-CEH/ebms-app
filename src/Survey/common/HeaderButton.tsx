import { ReactNode } from 'react';
import { observer } from 'mobx-react';
import clsx from 'clsx';
import { Button } from '@flumens';

interface Props {
  children: ReactNode;
  onClick: any;
  isInValid?: boolean;
}

const HeaderButton = ({ children, onClick, isInValid }: Props) => {
  return (
    <Button
      onPress={onClick}
      color={!isInValid ? 'secondary' : 'primary'}
      className={clsx(
        'max-w-28 whitespace-nowrap px-4 py-1 text-base',
        isInValid && 'opacity-50'
      )}
    >
      {children}
    </Button>
  );
};

export default observer(HeaderButton);
