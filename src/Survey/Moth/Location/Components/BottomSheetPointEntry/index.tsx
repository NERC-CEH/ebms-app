import React, { FC } from 'react';
import { IonLabel, IonIcon } from '@ionic/react';
import { pinOutline, arrowForwardOutline } from 'ionicons/icons';
import { MothTrap } from 'common/types';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

interface Props {
  point: MothTrap;
  updateRecord: any;
  isSelected?: boolean;
}

const PointEntry: FC<Props> = ({ point, updateRecord, isSelected }) => {
  const { name, latitude, longitude, distance } = point;

  const setLocation = () => updateRecord(point);

  if (isSelected) return null;

  return (
    <div className="box-container" onClick={setLocation}>
      <div className="box">
        <div className="icon">
          <IonIcon icon={pinOutline} />
        </div>

        <div className="label">
          <h4>{name}</h4>

          <IonLabel position="stacked" mode="ios">
            <IonLabel>
              <T>Lat</T>: {latitude.toFixed(3)}, <T>Long</T>:{' '}
              {longitude.toFixed(3)}
            </IonLabel>
          </IonLabel>
        </div>

        <div className="distance">
          <IonIcon icon={arrowForwardOutline} />
          <span>{distance} km</span>
        </div>
      </div>
    </div>
  );
};

export default observer(PointEntry);
