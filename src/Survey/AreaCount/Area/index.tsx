import { FC } from 'react';
import Sample from 'models/sample';
import { observer } from 'mobx-react';
import { Page } from '@flumens';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Main from './Main';
import './styles.scss';

type Props = {
  sample: Sample;
};

const AreaController: FC<Props> = ({ sample }) => {
  const { t } = useTranslation();

  const toggleGPStracking = (on: boolean) => {
    sample.toggleGPStracking(on);
  };

  const setLocation = (shape: any) => {
    sample.setLocation(shape);
  };

  const location = sample.attrs.location || {};
  const isGPSTracking = sample.isGPSRunning();
  const { area } = location;

  let areaPretty;
  if (area) {
    areaPretty = `${t('Selected area')}: ${area.toLocaleString()} m²`;
  } else {
    areaPretty = t('Please draw your area on the map');
  }

  const isDisabled = !!sample.metadata.synced_on;

  return (
    <Page id="area">
      <Header
        toggleGPStracking={toggleGPStracking}
        isGPSTracking={isGPSTracking}
        isDisabled={isDisabled}
      />
      <Main
        sample={sample}
        areaPretty={areaPretty}
        isGPSTracking={isGPSTracking}
        shape={location.shape}
        setLocation={setLocation}
        isDisabled={isDisabled}
      />
    </Page>
  );
};

export default observer(AreaController);
