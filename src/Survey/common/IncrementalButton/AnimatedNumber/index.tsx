import { FC, useState, useEffect } from 'react';
import { CreateAnimation } from '@ionic/react';
import './styles.scss';

type Props = {
  value: number;
};

const AnimatedNumber: FC<Props> = ({ value }: any) => {
  const [initialised, setInitialised] = useState<boolean>(false);
  const [play, setPlay] = useState<boolean>();

  const playAnimation = () => {
    initialised && setPlay(true);
    setInitialised(true); // not on the first load
  };
  useEffect(playAnimation, [value]);

  return (
    <CreateAnimation
      duration={2500}
      fromTo={[
        { property: 'color', fromValue: 'green', toValue: '' },
        { property: 'background', fromValue: '#00800024', toValue: '' },
      ]}
      onFinish={{
        callback: () => setPlay(false),
      }}
      play={play}
    >
      <span className="animated-number">{value}</span>
    </CreateAnimation>
  );
};

export default AnimatedNumber;
