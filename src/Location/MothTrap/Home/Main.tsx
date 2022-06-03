import { FC } from 'react';
import { Main, MenuAttrItem } from '@flumens';
import { pinOutline } from 'ionicons/icons';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemDivider,
  IonButton,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
} from '@ionic/react';
import clsx from 'clsx';
import { Trans as T, useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Lamp } from 'models/location';
import mothTrapIcon from 'common/images/moth-inside-icon.svg';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import GridRefValue from 'common/Components/GridRefValue';
import { observer } from 'mobx-react';
import './styles.scss';

type Props = {
  location: any;
  addNewLamp: any;
  deleteLamp: (lamp: Lamp) => void;
};

const MothTrapSetupMain: FC<Props> = ({ location, addNewLamp, deleteLamp }) => {
  const { type, lamps, location: loc, typeOther } = location.attrs;

  const { t } = useTranslation();

  const { url } = useRouteMatch();

  const hasLocation = loc.latitude;
  const hasName = loc.name;
  const empty = !hasLocation || !hasName;

  const locationValue = (
    <IonLabel position="stacked" mode="ios">
      <IonLabel color={clsx(empty && hasLocation && 'dark')}>
        <GridRefValue sample={location} />
      </IonLabel>
      <IonLabel color={clsx(empty && hasName && 'dark')}>
        {loc?.name || t('No moth trap name')}
      </IonLabel>
    </IonLabel>
  );

  const getLampAddButton = () => {
    return (
      <IonButton color="primary" id="add" onClick={addNewLamp}>
        <IonLabel>
          <T>Add lamp</T>
        </IonLabel>
      </IonButton>
    );
  };

  const getLampList = () => {
    if (!lamps.length) {
      return (
        <IonList id="list" lines="full">
          <InfoBackgroundMessage>No lamps added</InfoBackgroundMessage>
        </IonList>
      );
    }

    const getLampEntry = (entry: Lamp) => {
      const { quantity } = entry.attrs;
      const lampValue = entry.attrs.type || <T>Lamp</T>;

      const path = `${url}/lamps/${entry.cid}`;

      const deleteLampWrap = () => deleteLamp(entry);

      return (
        <IonItemSliding key={entry.cid}>
          <IonItem detail routerLink={path}>
            <IonLabel position="stacked" mode="ios">
              <IonLabel className="title">
                <span className="lamp-name">{lampValue}</span>
              </IonLabel>
              <IonLabel className="badge">
                {quantity && (
                  <IonBadge color="medium">Quantity: {quantity}</IonBadge>
                )}
              </IonLabel>
            </IonLabel>
          </IonItem>
          <IonItemOptions side="end" onClick={deleteLampWrap}>
            <IonItemOption color="danger">Delete</IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    const lampList = lamps.map(getLampEntry);

    return (
      <>
        <IonList id="list" lines="full">
          <div className="rounded">
            <IonItemDivider className="species-list-header">
              <IonLabel>Lamps</IonLabel>
              <IonLabel slot="end">{lampList.length}</IonLabel>
            </IonItemDivider>

            {lampList}
          </div>
        </IonList>
      </>
    );
  };

  const isOtherTypeSelected = type === 'Other trap';

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded">
          <MenuAttrItem
            routerLink={`/location/${location.cid}/location`}
            icon={pinOutline}
            label="Location"
            required
            className={clsx({ empty })}
            value={locationValue}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`/location/${location.cid}/type`}
            routerOptions={{ unmount: true }}
            icon={mothTrapIcon}
            label="Type"
            required
            value={type}
          />

          {isOtherTypeSelected && (
            <MenuAttrItem
              routerLink={`/location/${location.cid}/typeOther`}
              routerOptions={{ unmount: true }}
              icon={mothTrapIcon}
              label="Other type"
              value={typeOther}
            />
          )}
        </div>

        {getLampAddButton()}

        {getLampList()}
      </IonList>
    </Main>
  );
};

export default observer(MothTrapSetupMain);
