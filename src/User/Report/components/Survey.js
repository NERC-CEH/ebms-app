import React from 'react';
import PropTypes from 'prop-types';
import alert from 'common/helpers/alert';
import {
  IonItem,
  IonLabel,
  IonIcon,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
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
  const statusClass = sample.metadata.id ? 'sent' : 'unsent';
  return (
    <IonItemSliding>
      <IonItem>
        <IonLabel>
          <h3><b>{prettyDate}</b></h3>
          <h4>{`${t('species')}: ${speciesCount}`}</h4>
        </IonLabel>
        <IonIcon
          slot="end"
          name="paper-plane"
          size="small"
          className={`survey-status ${statusClass}`}
        />
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
