import { FC } from 'react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Button } from '@flumens';
import { isPlatform } from '@ionic/react';
import AnimatedNumber from './AnimatedNumber';

interface Props {
  onClick: any;
  onLongClick?: any;
  value: number;
  disabled?: boolean;
}

const IncrementalButton: FC<Props> = ({
  onClick: onClickProp,
  onLongClick: onLongClickProp,
  value,
  disabled,
}) => {
  const onClick = () => {
    if (disabled) return;

    onClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  const onLongClick = () => {
    if (disabled) return;

    if (!onLongClickProp) {
      onClickProp();
      return;
    }

    onLongClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Light });
  };

  return (
    <Button
      className="relative m-0 h-full w-[62px] rounded-none p-0 text-[1.3em] text-[var(--color-tertiary-800)]"
      onPress={onClick}
      fill="clear"
      onLongPress={onLongClick}
      preventDefault
    >
      <AnimatedNumber value={value} />
      <div className="absolute right-0 top-2 h-3/4 border-r border-solid border-r-[rgba(0,0,0,0.13)]" />
    </Button>
  );
};

export default IncrementalButton;
