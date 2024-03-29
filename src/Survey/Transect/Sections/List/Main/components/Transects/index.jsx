import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { informationCircleOutline } from 'ionicons/icons';
import PropTypes from 'prop-types';
import { Main, InfoMessage } from '@flumens';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import transformToLatLon from 'helpers/location';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import SVG from '../SVG';
import './styles.scss';

function showNoTransects() {
  return (
    <IonList lines="full">
      <InfoBackgroundMessage>
        You don&#39;t have any transects. Please try to refresh the list.
      </InfoBackgroundMessage>
    </IonList>
  );
}

function getTransectItem(transect, onTransectSelect) {
  const getSectionGeometry = section => {
    const geometry = toJS(section.geom);
    geometry.coordinates = transformToLatLon(geometry);
    return geometry;
  };
  const nonPoints = ({ type }) => type !== 'Point';
  const geometries = transect.sections
    .map(getSectionGeometry)
    .filter(nonPoints);

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
      <IonLabel slot="start">{transect.name || transect.id}</IonLabel>
      <IonLabel slot="end">{transect.sections.length}</IonLabel>
      {hasLines && <SVG geom={geom} />}
    </IonItem>
  );
}

function Transects({ appModel, onTransectSelect }) {
  const { transects } = appModel.attrs;

  const hasTransects = !!transects.length;
  const getTransectItemWrap = transect =>
    getTransectItem(transect, onTransectSelect);
  const transectsList = hasTransects
    ? transects.map(getTransectItemWrap)
    : showNoTransects();

  return (
    <Main id="transect-list">
      <InfoMessage
        startAddon={
          <IonIcon src={informationCircleOutline} className="size-6" />
        }
        color="tertiary"
      >
        Please select your transect first.
      </InfoMessage>

      <IonList lines="full">
        <div className="rounded">{transectsList}</div>
      </IonList>
    </Main>
  );
}

Transects.propTypes = {
  appModel: PropTypes.object.isRequired,
  onTransectSelect: PropTypes.func.isRequired,
};

export default observer(Transects);
