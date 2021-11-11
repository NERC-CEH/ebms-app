import React, { FC } from 'react';
import Occurrence from 'models/occurrence';
import { IonIcon, IonAvatar, IonLabel } from '@ionic/react';
import mothIcon from 'common/images/moth.svg';

interface Props {
  occurrence: typeof Occurrence;
}

const SpeciesInfo: FC<Props> = ({ occurrence }) => {
  const image = occurrence.media.length ? occurrence.media[0] : null;
  let avatar = <IonIcon icon={mothIcon} />;

  if (image) {
    avatar = <img src={image.getURL()} />;
  }

  const timestamp = new Date(occurrence.metadata.created_on).toISOString();
  const hours = new Date(timestamp).getHours();
  const minutes = new Date(timestamp).getMinutes();
  const minutesWithZero = minutes < 10 ? `0${minutes}` : minutes;
  const time = `${hours}:${minutesWithZero}`;

  const comment = occurrence.attrs.comment || null;

  return (
    <>
      <IonAvatar>{avatar}</IonAvatar>

      <IonLabel position="stacked" mode="ios" color="dark" className="label">
        <IonLabel className="timestamp">
          <b>{time}</b>
        </IonLabel>
        {comment && <IonLabel className="comment">{comment}</IonLabel>}
      </IonLabel>
    </>
  );
};

export default SpeciesInfo;
