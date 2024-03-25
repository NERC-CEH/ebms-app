import { forwardRef, useRef, useState } from 'react';
import { observable, toJS } from 'mobx';
import { observer } from 'mobx-react';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Main } from '@flumens';
import TextInput from '@flumens/tailwind/dist/components/Input';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonLabel,
  IonList,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from '@ionic/react';
import { Project } from 'common/models/sample';

const useDismissHandler = (newLocation: any) => {
  const [present] = useIonActionSheet();
  const canDismiss = () =>
    new Promise<boolean>(resolve => {
      const isEmpty = !Object.values(newLocation).length;
      if (isEmpty) return resolve(true);

      present({
        header: 'Are you sure?',
        subHeader: 'This will discard the new location form data.',
        buttons: [
          { text: 'Yes', role: 'confirm' },
          { text: 'No', role: 'cancel' },
        ],
        onWillDismiss: ev => resolve(ev.detail.role === 'confirm'),
      });
    });

  return canDismiss;
};

type Props = {
  presentingElement: any;
  isOpen: any;
  onCancel: any;
  onSave: any;
  project: Project;
  location: any;
};

const NewLocationModal = (
  { presentingElement, isOpen, onCancel, onSave, project, location }: Props,
  ref: any
) => {
  const [newLocation, setNewLocation] = useState<any>({});
  const isValidLocation = !!newLocation.name;

  const canDismiss = useDismissHandler(newLocation);

  const onSaveWrap = () => onSave(location);

  const cleanUp = () => setNewLocation(observable({}));

  const { area } = location;

  async function dismiss() {
    const closing = await ref.current?.dismiss();
    if (closing) onCancel();
  }

  return (
    <IonModal
      ref={ref}
      isOpen={isOpen}
      backdropDismiss={false}
      presentingElement={presentingElement}
      canDismiss={canDismiss}
      onWillDismiss={cleanUp}
    >
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={dismiss}>Cancel</IonButton>
          </IonButtons>
          <IonTitle>New Location</IonTitle>
          <IonButtons slot="end">
            <IonButton
              color={isValidLocation ? 'secondary' : 'medium'}
              fill="solid"
              shape="round"
              className="primary-button"
              onClick={onSaveWrap}
            >
              <IonLabel>Save</IonLabel>
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar id="area-edit-toolbar">
          <IonTitle size="small">
            <div className="text-with-icon-wrapper">
              <IonIcon icon={resizeOutline} />
              <T>Selected area</T>: {area?.toLocaleString()} m²
            </div>
          </IonTitle>
        </IonToolbar>
        <div className="bg-tertiary-600 p-1 text-center text-sm text-white">
          {project?.name}
        </div>
      </IonHeader>

      <Main>
        <IonList>
          <div className="rounded">
            <TextInput
              value={newLocation.name}
              label="Site name"
              onChange={(newVal: string) =>
                setNewLocation({ ...location, name: newVal })
              }
              platform="ios"
            />
          </div>
        </IonList>
      </Main>
    </IonModal>
  );
};

export default forwardRef(NewLocationModal);
