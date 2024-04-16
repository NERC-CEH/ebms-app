import { observer } from 'mobx-react';
import { informationCircleOutline } from 'ionicons/icons';
import wkt from 'wellknown';
import { Main, InfoMessage } from '@flumens';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import Location, {
  TRANSECT_SECTION_TYPE,
  TRANSECT_TYPE,
} from 'common/models/location';
import locations, { byType } from 'models/collections/locations';
import transformToLatLon from 'helpers/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import SVG from '../SVG';
import './styles.scss';

function getTransectItem(transect: Location, onTransectSelect: any) {
  const byTransectId = (section: Location) =>
    section.attrs.parentId === transect.id;
  const sections = locations
    .filter(byType(TRANSECT_SECTION_TYPE))
    .filter(byTransectId);

  const getSectionGeometry = (section: Location) => {
    const geometry = section.attrs.boundaryGeom;
    const shape: any = geometry ? wkt.parse(geometry) : {};
    shape.coordinates = transformToLatLon(shape);
    return shape;
  };

  const nonPoints = (geom?: any) => geom?.type !== 'Point';
  const geometries = sections.map(getSectionGeometry).filter(nonPoints);

  const geom = {
    type: 'GeometryCollection',
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
      <IonLabel slot="start">
        {transect.attrs.location.name || transect.id}
      </IonLabel>
      <IonLabel slot="end">{sections.length}</IonLabel>
      {hasLines && <SVG geom={geom} />}
    </IonItem>
  );
}

type Props = {
  onTransectSelect: any;
};

function Transects({ onTransectSelect }: Props) {
  const transects = locations.filter(byType(TRANSECT_TYPE));

  const hasTransects = !!transects.length;
  const getTransectItemWrap = (transect: Location) =>
    getTransectItem(transect, onTransectSelect);
  const transectsList = transects.map(getTransectItemWrap);

  return (
    <Main id="transect-list">
      <InfoMessage
        prefix={<IonIcon src={informationCircleOutline} className="size-6" />}
        color="tertiary"
      >
        Please select your transect first.
      </InfoMessage>

      <IonList lines="full">
        <div className="rounded-list">
          {hasTransects ? (
            transectsList
          ) : (
            <IonList lines="full">
              <InfoBackgroundMessage>
                You don&#39;t have any transects. Please try to refresh the
                list.
              </InfoBackgroundMessage>
            </IonList>
          )}
        </div>
      </IonList>
    </Main>
  );
}

export default observer(Transects);
