import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Main,
  Block,
  MenuAttrItem,
  MenuAttrItemFromModel,
  BlockContext,
} from '@flumens';
import { IonList } from '@ionic/react';
import MenuDateAttr from 'common/Components/MenuDateAttr';
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
  fieldCodeAttr,
  Data,
} from '../config';

type Props = {
  sample: Sample<Data>;
};

const DetailsMain = ({ sample }: Props) => {
  const { url } = useRouteMatch();

  const isDisabled = sample.isUploaded;

  return (
    <Main>
      <BlockContext value={{ isDisabled }}>
        <IonList lines="full">
          <h3 className="list-title">
            <T>Site</T>
          </h3>
          <div className="rounded-list">
            <MenuAttrItem
              routerLink={`${url}/location`}
              label="Site"
              icon={locationOutline}
              skipValueTranslation
              value={sample.data.location?.name}
              disabled={isDisabled}
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
            <Block record={sample.data} block={firstSampleDateAttr} />
            <Block record={sample.data} block={lastSampleDateAttr} />
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
            <Block record={sample.data} block={fieldCodeAttr} />
            <MenuAttrItemFromModel
              model={sample}
              attr="comment"
              skipValueTranslation
            />
          </div>
        </IonList>
      </BlockContext>
    </Main>
  );
};

export default observer(DetailsMain);
