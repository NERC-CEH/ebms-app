import { FC } from 'react';
import { isPlatform } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { LongPressButton } from '@flumens';
import AnimatedNumber from './AnimatedNumber';
import './styles.scss';

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

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Medium });
  };

  const onLongClick = () => {
    if (disabled) return;

    if (!onLongClickProp) {
      onClickProp();
      return;
    }

    onLongClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Heavy });
  };

  return (
    <LongPressButton
      className="incremental-button"
      onClick={onClick}
      fill="clear"
      onLongClick={onLongClick}
    >
      <AnimatedNumber value={value} />
      <div className="label-divider" />
    </LongPressButton>
  );
};

export default IncrementalButton;
