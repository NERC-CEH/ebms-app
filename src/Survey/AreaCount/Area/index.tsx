import { FC } from 'react';
import { observer } from 'mobx-react';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page } from '@flumens';
import { IonIcon } from '@ionic/react';
import Sample from 'models/sample';
import Header from './Header';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

const AreaController: FC<Props> = ({ sample }) => {
  const toggleGPStracking = (on: boolean) => {
    sample.toggleGPStracking(on);
  };

  const setLocation = (shape: any) => {
    sample.setLocation(shape);
  };

  const location = sample.attrs.location || {};
  const isGPSTracking = sample.isGPSRunning();
  const { area } = location;

  let infoText;
  if (area) {
    infoText = (
      <>
        <div className="text-with-icon-wrapper">
          <IonIcon icon={resizeOutline} />
          <T>Selected area</T>: {area.toLocaleString()} m²
        </div>
      </>
    );
  } else {
    infoText = (
      <>
        <T>Please draw your area on the map</T>
        {isGPSTracking && (
          <div>
            <T>Disable the GPS tracking to enable the drawing tools.</T>
          </div>
        )}
      </>
    );
  }

  const isDisabled = sample.isDisabled();

  const isAreaShape = location.shape?.type === 'Polygon';

  return (
    <Page id="area">
      <Header
        toggleGPStracking={toggleGPStracking}
        isGPSTracking={isGPSTracking}
        isDisabled={isDisabled}
        infoText={infoText}
        isAreaShape={isAreaShape}
      />
      <Main
        sample={sample}
        isGPSTracking={isGPSTracking}
        setLocation={setLocation}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(AreaController);
