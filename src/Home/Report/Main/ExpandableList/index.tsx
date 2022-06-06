import { FC, useState } from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

const MAX_ITEMS = 5;

const ExpandableList: FC<any> = ({ items: itemsProp }: any) => {
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
    </>
  );
};

export default ExpandableList;
