import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { withRouter } from 'react-router';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { toJS } from 'mobx';
import { Main } from '@apps';
import transformToLatLon from 'helpers/location';
import butterflyIcon from 'common/images/butterfly.svg';
import Transects from './components/Transects';
import SVG from './components/SVG';
import './styles.scss';

const getSectionItem = (sectionSample, match) => {
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

function Sections({ sample, appModel, onTransectSelect, match }) {
  const hasSelectedTransect = sample.attrs.location;
  if (!hasSelectedTransect) {
    return (
      <Transects appModel={appModel} onTransectSelect={onTransectSelect} />
    );
  }

  const getSectionItemWrap = s => getSectionItem(s, match);
  const sections = sample.samples.map(getSectionItemWrap);

  return (
    <Main id="transect-sections-list">
      <IonList lines="full">
        <div className="rounded">{sections}</div>
      </IonList>
    </Main>
  );
}

Sections.propTypes = {
  sample: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  onTransectSelect: PropTypes.func.isRequired,
};

export default withRouter(observer(Sections));
