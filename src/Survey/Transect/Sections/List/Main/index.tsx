import { FC } from 'react';
import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import { AppModel } from 'models/app';
import Sample from 'models/sample';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { toJS } from 'mobx';
import { Main } from '@flumens';
import transformToLatLon from 'helpers/location';
import butterflyIcon from 'common/images/butterfly.svg';
import Transects from './components/Transects';
import SVG from './components/SVG';
import './styles.scss';

const getSectionItem = (sectionSample: Sample, match: any) => {
  const section = sectionSample.attrs.location;
  const geometry = toJS(section.geom);

  geometry.coordinates = transformToLatLon(geometry);

  const geom = [
    {
      id: 4,
      properties: {},
      type: 'Feature',
      geometry,
    },
  ];
  const sectionSpeciesCount = sectionSample.occurrences.length;
  return (
    <IonItem
      key={sectionSample.cid}
      className="transect-section"
      routerLink={`${match.url}/${sectionSample.cid}`}
      detail
    >
      <SVG geom={geom} />

      <IonLabel class="ion-text-wrap" slot="start">
        {section.name || section.id}
      </IonLabel>
      {!!sectionSpeciesCount && (
        <IonLabel slot="end">
          <IonIcon icon={butterflyIcon} /> {/* prettier-ignore */}{' '}
          {sectionSpeciesCount}
        </IonLabel>
      )}
    </IonItem>
  );
};

type Props = {
  sample: Sample;
  appModel: AppModel;
  onTransectSelect: any;
};
const Sections: FC<Props> = ({ sample, appModel, onTransectSelect }) => {
  const match = useRouteMatch<any>();

  const hasSelectedTransect = sample.attrs.location;
  if (!hasSelectedTransect) {
    return (
      <Transects appModel={appModel} onTransectSelect={onTransectSelect} />
    );
  }

  const getSectionItemWrap = (s: Sample) => getSectionItem(s, match);
  const sections = sample.samples.map(getSectionItemWrap);

  return (
    <Main id="transect-sections-list">
      <IonList lines="full">
        <div className="rounded">{sections}</div>
      </IonList>
    </Main>
  );
};

export default observer(Sections);