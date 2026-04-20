import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, Block, MenuAttrItem, BlockContext } from '@flumens';
import { IonList } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import locations from 'common/models/collections/locations';
import Sample from 'models/sample';
import {
  stratumAttr,
  baitAttr,
  otherBaitAttr,
  trapCommentAttr,
  weatherAttr,
  humidityAttr,
  temperatureAttr,
  temperatureInTrapAttr,
  SubSmpData,
  timeAttr,
} from '../../config';

type Props = {
  subSample: Sample<SubSmpData>;
};

const TrapDetailsMain = ({ subSample }: Props) => {
  const { url } = useRouteMatch();

  const location = locations.idMap.get(subSample.data.locationId || '');
  const locationName = location?.data.name;

  return (
    <Main>
      <BlockContext value={{ isDisabled: subSample.isUploaded }}>
        <IonList lines="full">
          <div className="rounded-list">
            <MenuAttrItem
              routerLink={`${url}/location`}
              label="Trap location"
              skipValueTranslation
              icon={locationOutline}
              value={locationName}
              disabled
            />
            <MenuDateAttr
              label="Date"
              value={subSample.data.date}
              presentation="date"
              onChange={val => (subSample.data.date = val)} // eslint-disable-line no-return-assign, no-param-reassign
              isDisabled={subSample.isUploaded}
            />
            <MenuDateAttr
              label="Time"
              value={subSample.data[timeAttr.id]}
              presentation="time"
              onChange={val => (subSample.data[timeAttr.id] = val)} // eslint-disable-line no-return-assign, no-param-reassign
              isDisabled={subSample.isUploaded}
            />
            <Block record={subSample.data} block={stratumAttr} />
            <Block record={subSample.data} block={baitAttr} />
            <Block record={subSample.data} block={otherBaitAttr} />
            <Block record={subSample.data} block={trapCommentAttr} />
          </div>
        </IonList>

        <IonList lines="full">
          <h3 className="list-title">
            <T>Weather</T>
          </h3>
          <div className="rounded-list">
            <Block record={subSample.data} block={weatherAttr} />
            <Block record={subSample.data} block={humidityAttr} />
            <Block record={subSample.data} block={temperatureAttr} />
            <Block record={subSample.data} block={temperatureInTrapAttr} />
          </div>
        </IonList>
      </BlockContext>
    </Main>
  );
};

export default observer(TrapDetailsMain);
