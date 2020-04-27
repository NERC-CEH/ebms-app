import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { IonList, IonItem, IonLabel, IonIcon } from '@ionic/react';
import { toJS } from 'mobx';
import Main from 'Lib/Main';
import transformToLatLon from 'helpers/location';
import Transects from './components/Transects';
import SVG from './components/SVG';
import './styles.scss';
import 'common/images/butterfly.svg';

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
          <IonIcon src="/images/butterfly.svg" /> 
          {' '}
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

  const sections = sample.samples.map(s => getSectionItem(s, match));
  return (
    <Main id="transect-sections-list">
      <IonList lines="full">{sections}</IonList>
    </Main>
  );
}

Sections.propTypes = {
  sample: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  appModel: PropTypes.object.isRequired,
  onTransectSelect: PropTypes.func.isRequired,
};

export default observer(Sections);
