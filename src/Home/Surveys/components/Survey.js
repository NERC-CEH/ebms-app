import React from 'react';
import PropTypes from 'prop-types';
import alert from 'common/helpers/alert';
import { observer } from 'mobx-react';
import {
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import OnlineStatus from './components/OnlineStatus';

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

const Survey = observer(({ sample }) => {
  const date = new Date(sample.metadata.created_on);
  const prettyDate = date.toLocaleDateString();
  const speciesCount = sample.occurrences.models.length;

  const isSent = sample.metadata.server_on;
  const href =
    !isSent && !sample.remote.synchronising
      ? `/survey/${sample.cid}/edit`
      : null;

  return (
    <IonItemSliding>
      <IonItem href={href}>
        <IonLabel>
          <h3>
            <b>{prettyDate}</b>
          </h3>
          <h4>{`${t('species')}: ${speciesCount}`}</h4>
        </IonLabel>
        <OnlineStatus sample={sample} />
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={() => deleteSurvey(sample)}>
          {t('Delete')}
        </IonItemOption>
      </IonItemOptions>
    </IonItemSliding>
  );
});

Survey.propTypes = {
  sample: PropTypes.object.isRequired,
};

export default Survey;
