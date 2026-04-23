import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { locationOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Badge, Block, Button, Main, useAlert, useModalNav } from '@flumens';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonIcon,
  IonLabel,
  IonList,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import InfoBackgroundMessage from 'common/Components/InfoBackgroundMessage';
import type { Data as Record } from 'models/location';
import HeaderButton from 'Survey/common/HeaderButton';
import { useRecord } from '.';
import LampDetails from './LampDetails';
import LocationPicker from './Location';
import {
  Lamp,
  mothTrapLampDescriptionAttr,
  mothTrapLampQuantityAttr,
  mothTrapLampTypeAttr,
  mothTrapLampTypeNameAttr,
  mothTrapLampsAttr,
  mothTrapOtherTypeAttr,
  mothTrapTypeAttr,
  schema,
  trapNameAttr,
} from './config';

type Props = {
  onSave: (record: Partial<Record>) => Promise<boolean>;
};

const Details = ({ onSave }: Props) => {
  const nav = useModalNav();
  const alert = useAlert();
  const { record: model } = useRecord();

  const lamps = model[mothTrapLampsAttr.id] || [];

  const onDismiss = () => nav.dismiss();

  const isInvalid = !schema.safeParse(model).success;

  const onSaveWrap = async () => {
    if (isInvalid) return;

    const success = await onSave(model);
    if (!success) return;

    onDismiss();
  };

  const navigateToLocationPicker = () => nav.push(() => <LocationPicker />);

  const navigateToLamp = (lamp: Lamp) =>
    nav.push(() => <LampDetails lamp={lamp} />);

  const addNewLamp = () => {
    const nextLamp = observable({
      [mothTrapLampTypeNameAttr.id]: '',
      [mothTrapLampTypeAttr.id]: '',
      [mothTrapLampQuantityAttr.id]: 1,
      [mothTrapLampDescriptionAttr.id]: '',
    });

    if (!model[mothTrapLampsAttr.id]) model[mothTrapLampsAttr.id] = [];

    model[mothTrapLampsAttr.id]!.push(nextLamp);

    navigateToLamp(nextLamp);
  };

  const showDeleteLampPrompt = (index: number) => {
    const showPrompt = (resolve: (result: boolean) => void) => {
      alert({
        header: 'Delete',
        message:
          'Are you sure you want to delete this lamp entry from the moth trap?',
        buttons: [
          { text: 'Cancel', role: 'cancel', handler: () => resolve(false) },
          { text: 'Delete', role: 'destructive', handler: () => resolve(true) },
        ],
      });
    };

    const onConfirm = async () => {
      const shouldDelete = await new Promise<boolean>(showPrompt);
      if (!shouldDelete) return;

      model[mothTrapLampsAttr.id]!.splice(index, 1);
    };

    onConfirm();
  };

  const getLampList = () => {
    if (!lamps.length)
      return <InfoBackgroundMessage>No lamps added</InfoBackgroundMessage>;

    const renderLamp = (lamp: Lamp, index: number) => {
      const { quantity } = lamp;
      const lampValue = lamp.type || (
        <div className="text-warning">
          <T>Lamp</T>
        </div>
      );

      const onOpen = () => navigateToLamp(lamp);
      const onDelete = () => showDeleteLampPrompt(index);

      const key = JSON.stringify(lamp) + index;

      return (
        <IonItemSliding key={key}>
          <IonItem detail={false} button onClick={onOpen}>
            <div className="flex flex-col gap-1 overflow-hidden py-2">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
                {lampValue}
              </div>
              <div>
                {!!quantity && (
                  <Badge skipTranslation>
                    <T>Quantity</T>: {quantity}
                  </Badge>
                )}
              </div>
            </div>
          </IonItem>
          <IonItemOptions side="end" onClick={onDelete}>
            <IonItemOption color="danger">
              <T>Delete</T>
            </IonItemOption>
          </IonItemOptions>
        </IonItemSliding>
      );
    };

    const items = lamps.map(renderLamp);

    return (
      <IonList lines="full" className="m-3">
        <div className="rounded-list">{items}</div>
      </IonList>
    );
  };

  return (
    <>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={onDismiss}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <T>Moth trap</T>
          </IonTitle>
          <IonButtons slot="end">
            <HeaderButton isInvalid={isInvalid} onClick={onSaveWrap}>
              <T>Save</T>
            </HeaderButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <Main>
        <IonList lines="full" className="m-3">
          <div className="rounded-list">
            <Block record={model} block={trapNameAttr} />
            <IonItem detail onClick={navigateToLocationPicker}>
              <IonIcon slot="start" icon={locationOutline} />
              <IonLabel>
                <T>Location</T>
              </IonLabel>
              <IonLabel slot="end" className="text-sm mr-0">
                {model.centroidSref}
              </IonLabel>
            </IonItem>

            <Block block={mothTrapTypeAttr} record={model} />
            <Block block={mothTrapOtherTypeAttr} record={model} />
          </div>

          <Button color="primary" onPress={addNewLamp} className="mx-auto my-5">
            <T>Add lamp</T>
          </Button>
        </IonList>

        {getLampList()}
      </Main>
    </>
  );
};

export default observer(Details);
