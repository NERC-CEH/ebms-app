import { FC } from 'react';
import { isPlatform, IonButton } from '@ionic/react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import AnimatedNumber from './AnimatedNumber';
import './styles.scss';

interface Props {
  onClick: any;
  value: number;
  disabled?: boolean;
}

const IncrementalButton: FC<Props> = ({
  onClick: onClickProp,
  value,
  disabled,
}) => {
  const onClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) return;

    onClickProp();

    isPlatform('hybrid') && Haptics.impact({ style: ImpactStyle.Heavy });
  };

  return (
    <IonButton className="incremental-button" onClick={onClick} fill="clear">
      <AnimatedNumber value={value} />
      <div className="label-divider" />
    </IonButton>
  );
};

export default IncrementalButton;
