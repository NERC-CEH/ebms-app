import PropTypes from 'prop-types';
import { toJS } from 'mobx';
import { observer } from 'mobx-react';
import { IonList, IonItem, IonLabel } from '@ionic/react';
import { Main, InfoMessage } from '@flumens';
import { Trans as T } from 'react-i18next';
import { informationCircle } from 'ionicons/icons';
import transformToLatLon from 'helpers/location';
import SVG from '../SVG';
import './styles.scss';

function showNoTransects() {
  return (
    <IonList lines="full">
      <IonItem className="empty">
        <span>
          <T>
            You don&#39;t have any transects. Please try to refresh the list.
          </T>
        </span>
      </IonItem>
    </IonList>
  );
}

function getTransectItem(transect, onTransectSelect) {
  const getSectionGeometry = section => {
    const geometry = toJS(section.geom);
    geometry.coordinates = transformToLatLon(geometry);
    return geometry;
  };
  const geometries = transect.sections.map(getSectionGeometry);

  const geom = {
    type: 'GeometryCollection',
    geometries,
  };

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
      <SVG geom={geom} />
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
      <InfoMessage className="blue" icon={informationCircle}>
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
