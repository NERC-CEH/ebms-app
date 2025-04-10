import { useState, useEffect, useRef } from 'react';
import { CreateAnimation } from '@ionic/react';
import './styles.scss';

type Props = {
  value: number;
};

const AnimatedNumber = ({ value }: Props) => {
  const [initialised, setInitialised] = useState<boolean>(false);
  const first = useRef<any>(null);

  const playAnimation = () => {
    if (!initialised) {
      setInitialised(true); // not on the first load
      return;
    }

    // doing this programmatically to reset the progress
    // on value change before animation finishes
    first.current.animation.progressStep(0);
    first.current.animation.play();
  };
  useEffect(playAnimation, [value, first]);

  return (
    <CreateAnimation
      duration={2500}
      ref={first}
      fromTo={[
        {
          property: 'color',
          fromValue: 'var(--color-tertiary-950)',
          toValue: 'var(--color-tertiary-800)',
        },
        {
          property: 'background',
          fromValue: 'rgba(var(--color-tertiary-800-rgb),0.1)',
          toValue: '',
        },
      ]}
    >
      <span className="animated-number">{value}</span>
    </CreateAnimation>
  );
};

export default AnimatedNumber;
