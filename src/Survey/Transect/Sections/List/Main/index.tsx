import { observer } from 'mobx-react';
import type { Feature, Geometry } from 'geojson';
import { useRouteMatch } from 'react-router';
import wkt from 'wellknown';
import { Main, getGeomMetersToLatLon } from '@flumens';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import butterflyIcon from 'common/images/butterfly.svg';
import locations from 'common/models/collections/locations';
import Sample from 'models/sample';
import SVG from './components/SVG';

const getSectionItem = (sectionSample: Sample, match: { url: string }) => {
  const section = locations.idMap.get(sectionSample.data.locationId || '');

  const locationName =
    section?.data.name || section?.data.code || sectionSample.data.locationId;

  let geom: Feature[] | null = null;
  if (section?.data.boundaryGeom) {
    const parsed = wkt.parse(section.data.boundaryGeom) as Geometry | null;
    if (
      parsed &&
      parsed.type !== 'GeometryCollection' &&
      parsed.type !== 'MultiLineString' &&
      parsed.type !== 'MultiPoint'
    ) {
      const geometry = getGeomMetersToLatLon(parsed);
      if (geometry.type !== 'Point') {
        geom = [{ type: 'Feature', properties: null, geometry }];
      }
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
      {!!geom && (
        <div className="m-0.5">
          <SVG geom={geom} />
        </div>
      )}

      <IonLabel className="ion-text-wrap" slot="start">
        {locationName}
      </IonLabel>
      {!!sectionSpeciesCount && (
        <div
          slot="end"
          className="flex min-w-12 gap-3 text-left text-[var(--form-value-color)] justify-start items-center"
        >
          <IonIcon icon={butterflyIcon} />
          {sectionSpeciesCount}
        </div>
      )}
    </IonItem>
  );
};

type Props = {
  sample: Sample;
};
const Sections = ({ sample }: Props) => {
  const match = useRouteMatch();

  const getSectionItemWrap = (s: Sample) => getSectionItem(s, match);

  const sections = sample.samples.map(getSectionItemWrap);

  return (
    <Main className="pb-ion-s-10">
      <IonList lines="full">
        <div className="rounded-list">{sections}</div>
      </IonList>
    </Main>
  );
};

export default observer(Sections);
