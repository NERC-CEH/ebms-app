import { observer } from 'mobx-react';
import type { LineString, MultiPolygon, Point, Polygon } from 'geojson';
import { informationCircleOutline } from 'ionicons/icons';
import wkt from 'wellknown';
import { Main, InfoMessage, getGeomMetersToLatLon } from '@flumens';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import Location, { LocationType } from 'common/models/location';
import locations, { byType } from 'models/collections/locations';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import SVG from '../SVG';
import './styles.scss';

type Shape = LineString | Polygon | MultiPolygon | Point;

function getTransectItem(
  transect: Location,
  onTransectSelect: (transect: Location) => void
) {
  const byTransectId = (section: Location) =>
    section.data.parentId === transect.id;
  const sections = locations
    .filter(byType(LocationType.TransectSection))
    .filter(byTransectId);

  const getSectionGeometry = (section: Location) => {
    const geometry = section.data.boundaryGeom;
    const shape = geometry ? (wkt.parse(geometry) as Shape | null) : null;
    if (!shape) return null;

    return getGeomMetersToLatLon(shape) as Shape;
  };

  const geometries = sections
    .map(getSectionGeometry)
    .filter(geom => !!geom && geom.type !== 'Point');

  const geom = {
    type: 'GeometryCollection' as const,
    geometries,
  };

  const hasLines = !!geometries.length;

  const onTransectSelectWrap = () => onTransectSelect(transect);

  return (
    <IonItem
      key={transect.id}
      className="transect"
      onClick={onTransectSelectWrap}
      detail
    >
      <IonLabel slot="start">{transect.data.name || transect.id}</IonLabel>
      <IonLabel slot="end">{sections.length}</IonLabel>
      {hasLines && <SVG geom={geom} />}
    </IonItem>
  );
}

type Props = {
  onTransectSelect: (transect: Location) => void;
};

function Transects({ onTransectSelect }: Props) {
  const transects = locations.filter(byType(LocationType.Transect));

  const hasTransects = !!transects.length;
  const getTransectItemWrap = (transect: Location) =>
    getTransectItem(transect, onTransectSelect);
  const transectsList = transects.map(getTransectItemWrap);

  return (
    <Main id="transect-list" className="pb-ion-s-10">
      <InfoMessage
        prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
        color="tertiary"
        className="m-3"
      >
        transect.pleaseSelectTransect
      </InfoMessage>

      {hasTransects ? (
        <IonList lines="full">
          <div className="rounded-list">{transectsList}</div>
        </IonList>
      ) : (
        <InfoBackgroundMessage>transect.donTHave</InfoBackgroundMessage>
      )}
    </Main>
  );
}

export default observer(Transects);
