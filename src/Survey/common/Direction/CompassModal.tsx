import { FC, useEffect, useState } from 'react';
import { closeOutline } from 'ionicons/icons';
import { IonBackdrop, IonIcon } from '@ionic/react';
import Compass from '../Compass';
import './styles.scss';

type Props = {
  hideCompass: () => void;
  value: any;
};

const CompassModal: FC<Props> = ({ hideCompass, value }) => {
  const [state, setstate] = useState(0);

  useEffect(() => {
    setstate(Math.round(value));
  });

  const directionNames = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

  const getDirectionName = (dir: number) => {
    const sections = directionNames.length;
    const sect = 360 / sections;
    let index = Math.floor((dir + sect / 2) / sect);

    index = index >= sections ? 0 : index;

    return directionNames[index];
  };

  const absoluteDirectionValue = Math.abs(state % 360);

  const normalizeDirectionValue =
    state > 0 ? 360 - absoluteDirectionValue : absoluteDirectionValue;

  const compassDirectionName = getDirectionName(normalizeDirectionValue);

  return (
    <>
      <IonBackdrop className="compass-big" visible={false} />
      <div id="box">
        <div className="close-button">
          <IonIcon icon={closeOutline} onClick={hideCompass} />
        </div>

        <div className="compass-wrapper">
          <div className="value">
            <p>
              {normalizeDirectionValue}&deg; {compassDirectionName}
            </p>
          </div>

          <Compass direction={state} />
        </div>
      </div>
    </>
  );
};
export default CompassModal;
