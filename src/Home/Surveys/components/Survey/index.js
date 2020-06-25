import React from 'react';
import PropTypes from 'prop-types';
import alert from 'common/helpers/alert';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import {
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonIcon,
  IonBadge,
} from '@ionic/react';
import { open } from 'ionicons/icons';
import OnlineStatus from './components/OnlineStatus';
import ErrorMessage from './components/ErrorMessage';
import 'common/images/butterfly.svg';
import './styles.scss';

function deleteSurvey(sample) {
  alert({
    header: t('Delete'),
    message: t('Are you sure you want to delete this survey?'),
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'secondary',
        handler: () => sample.destroy(),
      },
    ],
  });
}

const Survey = observer(({ sample }) => {
  const date = new Date(sample.metadata.created_on);
  const prettyDate = date.toLocaleDateString();
  const survey = sample.getSurvey().name;

  let speciesCount = sample.occurrences.length;
  if (survey === 'area') {
    const isNotZeroCount = occ => occ.attrs.count;
    speciesCount = sample.occurrences.filter(isNotZeroCount).length;
  }

  const href = !sample.remote.synchronising
    ? `/survey/${survey}/${sample.cid}/edit`
    : undefined;

  let externalHref;

  function getSampleInfo() {
    if (survey === 'transect') {
      return (
        <IonLabel class="ion-text-wrap">
          <h3>
            <b>
              <T>Transect</T>
            </b>
          </h3>
          <h3>{prettyDate}</h3>
        </IonLabel>
      );
    }

    return (
      <IonLabel class="ion-text-wrap">
        <h3>
          <b>
            <T>15min Count</T>
          </b>
        </h3>
        <h3>{prettyDate}</h3>
        <IonBadge color="medium">
          <IonIcon src="/images/butterfly.svg" /> {speciesCount}
        </IonBadge>
      </IonLabel>
    );
  }
  return (
    <IonItemSliding class="survey-list-item">
      <ErrorMessage sample={sample} />
      <IonItem
        routerLink={href}
        href={externalHref}
        detailIcon={externalHref ? open : undefined}
      >
        {getSampleInfo()}
        <OnlineStatus sample={sample} />
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => deleteSurvey(sample)}>
          <T>Delete</T>
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
});

Survey.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Survey;
