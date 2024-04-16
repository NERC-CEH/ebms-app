import { createRef, useState } from 'react';
import { Trans as T, useTranslation } from 'react-i18next';
import { Main, useOnHideModal } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
  IonToggle,
  IonInput,
} from '@ionic/react';
import HeaderButton from 'Survey/common/HeaderButton';

type Location = any;

type Props = {
  location?: Location;
  onLocationSave: any;
};

const EditModal = ({ location, onLocationSave }: Props) => {
  const { t } = useTranslation();

  const [locationName, setLocationName] = useState(location.name);
  const [locationIsFavorite, setLocationIsFavorite] = useState(
    location.favorite
  );

  useOnHideModal(onLocationSave);

  const inputRef = createRef<any>();

  const toggleRef = createRef<any>();

  const closeModal = () => onLocationSave();

  const onChangeLocationName = (event: any) => {
    setLocationName(event.detail.value);
  };

  const onChangeFavoriteStatus = (event: any) => {
    setLocationIsFavorite(event.detail.checked);
  };

  const save = () =>
    onLocationSave(inputRef.current.value, toggleRef.current.checked);

  const form = (
    <IonList className="location-edit-form">
      <div className="rounded-list">
        <IonItem>
          <IonLabel>
            <T>Name</T>
          </IonLabel>
          <IonInput
            id="location-name"
            type="text"
            placeholder={t('Your track name')}
            value={locationName}
            onIonChange={onChangeLocationName}
            ref={inputRef}
          />
        </IonItem>
        <IonItem>
          <IonLabel>
            <T>Favourite</T>
          </IonLabel>
          <IonToggle
            slot="end"
            id="favourite-btn"
            onIonChange={onChangeFavoriteStatus}
            checked={locationIsFavorite}
            ref={toggleRef}
          />
        </IonItem>
      </div>
    </IonList>
  );

  return (
    <IonModal isOpen={!!location?.name}>
      <IonHeader translucent>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={closeModal}>
              <T>Cancel</T>
            </IonButton>
          </IonButtons>
          <IonTitle>
            <T>Edit</T>
          </IonTitle>
          <IonButtons slot="end">
            <HeaderButton onClick={save}>Save</HeaderButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <Main fullscreen>{form}</Main>
    </IonModal>
  );
};

export default EditModal;
