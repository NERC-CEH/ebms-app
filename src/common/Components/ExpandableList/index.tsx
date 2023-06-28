import { FC, useState } from 'react';
import { Trans as T } from 'react-i18next';
import { IonItem, IonLabel } from '@ionic/react';
import './styles.scss';

const MAX_ITEMS = 5;

const ExpandableList: FC<any> = ({ children: itemsProp }: any) => {
  const [showMore, setShowMore] = useState(false);
  const items = itemsProp.slice(0, MAX_ITEMS);
  const restItems = itemsProp.slice(MAX_ITEMS, itemsProp.length);

  const hidingMoreThanTwo = restItems.length >= 2;

  return (
    <>
      {items}

      {hidingMoreThanTwo && !showMore && (
        <IonItem className="expandable-list" onClick={() => setShowMore(true)}>
          <IonLabel>
            <T>Show more</T>
          </IonLabel>
        </IonItem>
      )}

      {!showMore && !hidingMoreThanTwo && restItems}

      {showMore && restItems}

      {hidingMoreThanTwo && showMore && (
        <IonItem className="expandable-list" onClick={() => setShowMore(false)}>
          <IonLabel>
            <T>Show less</T>
          </IonLabel>
        </IonItem>
      )}
    </>
  );
};

export default ExpandableList;
