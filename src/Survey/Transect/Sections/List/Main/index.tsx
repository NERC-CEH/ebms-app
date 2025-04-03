import { observer } from 'mobx-react';
import { useRouteMatch } from 'react-router';
import wkt from 'wellknown';
import { Main, transformToLatLon } from '@flumens';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import Sample from 'models/sample';
import SVG from './components/SVG';
import Transects from './components/Transects';
import './styles.scss';

const getSectionItem = (sectionSample: Sample, match: any) => {
  const section = sectionSample.data.location!;

  let geom: any;
  if ('boundaryGeom' in section && section.boundaryGeom) {
    geom = wkt.parse(section.boundaryGeom!);
    geom.coordinates = transformToLatLon(geom);
    geom = [{ type: 'Feature', geometry: geom }];
    if (geom?.type === 'Point') {
      geom = null;
    }
  }

  const sectionSpeciesCount = sectionSample.occurrences.length;

  return (
    <IonItem
      key={sectionSample.cid}
      className="transect-section"
      routerLink={`${match.url}/${sectionSample.id || sectionSample.cid}`}
      detail
    >
      {!!geom && <SVG geom={geom} />}

      <IonLabel className="ion-text-wrap" slot="start">
        {section.name || (section as any).code}
      </IonLabel>
      {!!sectionSpeciesCount && (
        <div
          slot="end"
          className="flex min-w-12 gap-3 text-left text-[var(--form-value-color)]"
        >
          <IonIcon icon={butterflyIcon} /> {/* prettier-ignore */}{' '}
          {sectionSpeciesCount}
        </div>
      )}
    </IonItem>
  );
};

type Props = {
  sample: Sample;
  onTransectSelect: any;
};
const Sections = ({ sample, onTransectSelect }: Props) => {
  const match = useRouteMatch<any>();

  const hasSelectedTransect = sample.data.location;
  if (!hasSelectedTransect)
    return <Transects onTransectSelect={onTransectSelect} />;

  const getSectionItemWrap = (s: Sample) => getSectionItem(s, match);

  const sections = sample.samples.map(getSectionItemWrap);

  return (
    <Main id="transect-sections-list">
      <IonList lines="full">
        <div className="rounded-list">{sections}</div>
      </IonList>
    </Main>
  );
};

export default observer(Sections);
