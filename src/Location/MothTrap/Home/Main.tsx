import { observer } from 'mobx-react';
import clsx from 'clsx';
import { pinOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { useRouteMatch } from 'react-router';
import {
  Button,
  Main,
  MenuAttrItem,
  Badge,
  Block,
  BlockContext,
} from '@flumens';
import {
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import PrettyLocation from 'common/Components/PrettyLocation';
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
    <div className="flex flex-col gap-1">
      <PrettyLocation sample={location} />
      <div>{loc?.name || t('No moth trap name')}</div>
    </div>
  );

  const getLampAddButton = () => (
    <Button color="primary" onPress={addNewLamp} className="mx-auto my-10">
      Add lamp
    </Button>
  );

  const getLampList = () => {
    if (!lamps.length)
      return <InfoBackgroundMessage>No lamps added</InfoBackgroundMessage>;

    const getLampEntry = (entry: Lamp) => {
      const { quantity } = entry.data;

      const lampValue = entry.data.type || (
        <div className="text-warning">
          <T>Lamp</T>
        </div>
      );

      const path = `${url}/lamps/${entry.cid}`;

      const deleteLampWrap = () => deleteLamp(entry);

      return (
        <IonItemSliding key={entry.cid}>
          <IonItem routerLink={path} detail={false}>
            <div className="flex flex-col gap-1 overflow-hidden py-2">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
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
        <div className="list-divider">
          <div>
            <T>Lamps</T>
          </div>
          <div>{lampList.length}</div>
        </div>

        {lampList}
      </div>
    );
  };

  return (
    <Main>
      <BlockContext value={{ isDisabled: location.isDisabled }}>
        <IonList lines="full">
          <div className="rounded-list">
            <MenuAttrItem
              routerLink={`${url}/location`}
              icon={pinOutline}
              label="Location"
              required
              className={clsx({ empty })}
              value={locationValue}
              skipValueTranslation
            />

            <Block block={mothTrapTypeAttr} record={location.data} />

            <Block block={mothTrapOtherTypeAttr} record={location.data} />
          </div>

          {getLampAddButton()}

          {getLampList()}
        </IonList>
      </BlockContext>
    </Main>
  );
};

export default observer(MothTrapHomeMain);
