import React from 'react';
import PropTypes from 'prop-types';
import alert from 'common/helpers/alert';
import {
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';

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
        handler: () => {
          sample.destroy();
        },
      },
    ],
  });
}

function Survey({ sample }) {
  const date = new Date(sample.metadata.created_on);
  const prettyDate = date.toLocaleDateString();
  const speciesCount = sample.occurrences.models.length;
  return (
    <IonItemSliding>
      <IonItem>
        <b>{prettyDate}</b>
        <IonLabel slot="end">{`${t('species')}: ${speciesCount}`}</IonLabel>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => deleteSurvey(sample)}>
          {t('Delete')}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
}

Survey.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Survey;
