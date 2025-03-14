import { observer } from 'mobx-react';
import clsx from 'clsx';
import { pinOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import { Button, Main, MenuAttrItem, Badge, Block } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import GridRefValue from 'common/Components/GridRefValue';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import {
  Lamp,
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapTypeAttr,
} from 'models/location';

type Props = {
  location: any;
  addNewLamp: any;
  deleteLamp: (lamp: Lamp) => void;
};

const MothTrapHomeMain = ({ location, addNewLamp, deleteLamp }: Props) => {
  const { location: loc = {} } = location.data;

  const lamps = location.data[mothTrapLampsAttr.id] || [];

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
      <Button color="primary" onPress={addNewLamp} className="mx-auto my-10">
        Add lamp
      </Button>
    );
  };

  const getLampList = () => {
    if (!lamps.length)
      return <InfoBackgroundMessage>No lamps added</InfoBackgroundMessage>;

    const getLampEntry = (entry: Lamp) => {
      const { quantity } = entry.data;

      const lampValue = entry.data.type || <T>Lamp</T>;

      const path = `${url}/lamps/${entry.cid}`;

      const deleteLampWrap = () => deleteLamp(entry);

      return (
        <IonItemSliding key={entry.cid}>
          <IonItem routerLink={path} detail={false}>
            <div className="flex flex-col gap-1 overflow-hidden py-2">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {lampValue}
                {lampValue}
              </div>
              <div className="">
                {!!quantity && (
                  <Badge skipTranslation>
                    <T>Quantity</T>: {quantity}
                  </Badge>
                )}
              </div>
            </div>
          </IonItem>
          <IonItemOptions side="end" onClick={deleteLampWrap}>
            <IonItemOption color="danger">Delete</IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    const lampList = lamps.map(getLampEntry);

    return (
      <div className="rounded-list">
        <h3 className="list-divider">
          <div>
            <T>Lamps</T>
          </div>
          <div>{lampList.length}</div>
        </h3>

        {lampList}
      </div>
    );
  };

  return (
    <Main>
      <IonList lines="full">
        <div className="rounded-list">
          <MenuAttrItem
            routerLink={`/location/${location.cid}/location`}
            icon={pinOutline}
            label="Location"
            required
            className={clsx({ empty })}
            value={locationValue}
            skipValueTranslation
          />

          <Block
            block={mothTrapTypeAttr}
            record={location.data}
            isDisabled={location.isDisabled}
          />

          <Block
            block={mothTrapOtherTypeAttr}
            record={location.data}
            isDisabled={location.isDisabled}
          />
        </div>

        {getLampAddButton()}

        {getLampList()}
      </IonList>
    </Main>
  );
};

export default observer(MothTrapHomeMain);
