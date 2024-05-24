import { forwardRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { resizeOutline } from 'ionicons/icons';
import { Trans as T, useTranslation } from 'react-i18next';
import { z, object } from 'zod';
import { Main } from '@flumens';
import TextInput from '@flumens/tailwind/dist/components/Input';
import { isPlatform } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
  useIonActionSheet,
} from '@ionic/react';
import { getGeomString } from 'common/helpers/location';
import { GROUP_SITE_TYPE } from 'common/models/location';
import { AreaCountLocation, Group } from 'common/models/sample';
import HeaderButton from 'Survey/common/HeaderButton';

const schema = object({
  id: z.string(),
  locationTypeId: z.string(),
  createdOn: z.string(),
  updatedOn: z.string(),
  name: z.string().min(1, 'Please fill in'),
  lat: z.string(),
  lon: z.string(),
  centroidSref: z.string(),
  centroidSrefSystem: z.string(),
  boundaryGeom: z.string(),
  comment: z.string().optional(),
});

type FixedLocation = z.infer<typeof schema>;

const useDismissHandler = (newLocation: any) => {
  const { t } = useTranslation();
  const [present] = useIonActionSheet();

  const canDismiss = (force?: boolean) =>
    new Promise<boolean>(resolve => {
      const isEmpty = !newLocation.name && !newLocation.comment;
      if (isEmpty || force) {
        resolve(true);
        return;
      }

      present({
        header: t('Are you sure?'),
        subHeader: t('This will discard the form data.'),
        buttons: [
          { text: t('Yes'), role: 'confirm' },
          { text: t('No'), role: 'cancel' },
        ],
        onWillDismiss: ev => resolve(ev.detail.role === 'confirm'),
      });
    });

  return canDismiss;
};

const getNewLocationSeed = (location?: AreaCountLocation) => ({
  id: '',
  locationTypeId: GROUP_SITE_TYPE,
  createdOn: new Date().toISOString(),
  updatedOn: new Date().toISOString(),
  boundaryGeom: location?.shape ? getGeomString(location?.shape) : '',
  lat: `${location?.latitude}`,
  lon: `${location?.longitude}`,
  centroidSref: `${location?.latitude} ${location?.longitude}`,
  centroidSrefSystem: '4326',
  name: '',
  comment: '',
});

type Props = {
  presentingElement: any;
  isOpen: any;
  onCancel: any;
  onSave: (location: FixedLocation) => Promise<boolean>;
  group: Group;
  location: AreaCountLocation;
};

const NewLocationModal = (
  { presentingElement, isOpen, onCancel, onSave, group, location }: Props,
  ref: any
) => {
  const [newLocation, setNewLocation] = useState<FixedLocation>(
    getNewLocationSeed(location)
  );

  useEffect(() => {
    // we don't care of overwriting the form values as the location shouldn't change while the GPS is off
    setNewLocation(getNewLocationSeed(location));
  }, [location]);

  const { success: isValidLocation } = schema.safeParse(newLocation);

  const canDismiss = useDismissHandler(newLocation || {});

  const cleanUp = () => setNewLocation(getNewLocationSeed(location));

  const { area } = location;

  const dismiss = async (force?: boolean) => {
    const closing = await ref.current?.dismiss(force);
    if (closing) onCancel();
  };

  const onSaveWrap = async () => {
    if (!isValidLocation) return;

    const success = await onSave(newLocation);
    if (!success) return;

    dismiss(true);
  };

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
            <IonButton onClick={() => dismiss()}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle className={clsx(isPlatform('ios') && 'pr-[130px]')}>
            <T>New location</T>
          </IonTitle>
          <IonButtons slot="end">
            <HeaderButton isInvalid={!isValidLocation} onClick={onSaveWrap}>
              Save
            </HeaderButton>
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
          {group?.title}
        </div>
      </IonHeader>

      <Main>
        <div className="rounded-list m-3">
          <TextInput
            value={newLocation.name}
            label="Site name"
            onChange={(newVal: string) =>
              setNewLocation({ ...newLocation, name: newVal })
            }
            platform="ios"
          />
          <TextInput
            value={newLocation.comment}
            label="Comments"
            onChange={(newVal: string) =>
              setNewLocation({ ...newLocation, comment: newVal })
            }
            platform="ios"
            labelPlacement="floating"
            isMultiline
          />
        </div>
      </Main>
    </IonModal>
  );
};

export default forwardRef(NewLocationModal);
