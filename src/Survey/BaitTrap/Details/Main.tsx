import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Main, Block, MenuAttrItem, BlockContext, InfoMessage } from '@flumens';
import { IonList } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
import locations from 'common/models/collections/locations';
import Sample from 'models/sample';
import {
  trapsAttr,
  trapsCarrionAttr,
  trapsBananaAttr,
  trapsOtherAttr,
  numberOfDaysAttr,
  firstSampleDateAttr,
  lastSampleDateAttr,
  collectorsAttr,
  eventTypeAttr,
  samplingDesignAttr,
  carrionBaitAttr,
  fieldCodeStartAttr,
  Data,
  surveyCommentAttr,
} from '../config';

type Props = {
  sample: Sample<Data>;
};

const DetailsMain = ({ sample }: Props) => {
  const { url } = useRouteMatch();

  const isDisabled = sample.isUploaded;
  const { completedDetails } = sample.metadata;

  const location = locations.idMap.get(sample.data.locationId || '');
  const locationName = location?.data.name;

  return (
    <Main className="[--padding-bottom:20px]">
      <BlockContext value={{ isDisabled }}>
        <IonList lines="full">
          <h3 className="list-title">
            <T>Trapping Site</T>
          </h3>
          <div className="rounded-list">
            <MenuAttrItem
              routerLink={`${url}/location`}
              label="Site"
              icon={locationOutline}
              skipValueTranslation
              value={locationName}
              disabled={isDisabled || completedDetails}
            />
            <Block record={sample.data} block={trapsAttr} />
            <Block record={sample.data} block={trapsCarrionAttr} />
            <Block record={sample.data} block={trapsBananaAttr} />
            <Block record={sample.data} block={trapsOtherAttr} />
          </div>
        </IonList>

        <IonList lines="full">
          <h3 className="list-title">
            <T>Dates</T>
          </h3>
          <div className="rounded-list">
            <MenuDateAttr
              label="Date"
              value={sample.data.date}
              onChange={val => (sample.data.date = val)} // eslint-disable-line no-return-assign, no-param-reassign
              isDisabled={sample.isUploaded}
            />
            <Block record={sample.data} block={numberOfDaysAttr} />
            <MenuDateAttr
              label={firstSampleDateAttr.title}
              value={sample.data[firstSampleDateAttr.id]}
              onChange={val => (sample.data[firstSampleDateAttr.id] = val)} // eslint-disable-line no-return-assign, no-param-reassign
              isDisabled={sample.isUploaded}
            />
            <MenuDateAttr
              label={lastSampleDateAttr.title}
              value={sample.data[lastSampleDateAttr.id]}
              onChange={val => (sample.data[lastSampleDateAttr.id] = val)} // eslint-disable-line no-return-assign, no-param-reassign
              isDisabled={sample.isUploaded}
            />
          </div>
        </IonList>

        <IonList lines="full">
          <h3 className="list-title">
            <T>Other</T>
          </h3>
          <div className="rounded-list">
            <Block record={sample.data} block={collectorsAttr} />
            <Block record={sample.data} block={eventTypeAttr} />
            <Block record={sample.data} block={samplingDesignAttr} />
            <Block record={sample.data} block={carrionBaitAttr} />
            <Block
              record={sample.data}
              block={fieldCodeStartAttr}
              isDisabled={sample.metadata.completedDetails}
            />
            <InfoMessage inline>
              A letter followed by a number, e.g. A1.
            </InfoMessage>
            <Block record={sample.data} block={surveyCommentAttr} />
          </div>
        </IonList>
      </BlockContext>
    </Main>
  );
};

export default observer(DetailsMain);
