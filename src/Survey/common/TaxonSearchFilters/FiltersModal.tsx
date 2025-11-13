import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Main, Checkbox, InfoMessage, CheckboxOption } from '@flumens';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
} from '@ionic/react';
import groups from 'common/data/groups';
import appModel from 'models/app';
import Sample from 'models/sample';
import './styles.scss';

const DAY_FLYING_MOTHS = 'day-flying-moths';

type Props = {
  toggleModal: () => void;
  showModal: boolean;
  sample?: Sample;
};

const FiltersModal = ({ toggleModal, showModal, sample }: Props) => {
  const onChange = (newValuesArg: string[]) => {
    // eslint-disable-next-line no-param-reassign
    const newValues: number[] = newValuesArg
      .filter((group: string) => group !== DAY_FLYING_MOTHS)
      .map(id => Number.parseInt(id, 10));

    const hasDayFlyingMothGroup = newValuesArg.includes(DAY_FLYING_MOTHS);
    const hasMothGroup = newValues.includes(groups.moths.id);

    // keep in global app model for next samples
    appModel.data.useDayFlyingMothsOnly = hasMothGroup && hasDayFlyingMothGroup;
    appModel.data.speciesGroups = newValues;
    appModel.save();

    if (sample) {
      // eslint-disable-next-line no-param-reassign
      sample.metadata.useDayFlyingMothsOnly =
        appModel.data.useDayFlyingMothsOnly;
      // eslint-disable-next-line no-param-reassign
      sample.data.speciesGroups = appModel.data.speciesGroups;
      sample.save();
    }
  };

  const speciesGroups =
    sample?.data.speciesGroups || appModel.data.speciesGroups;
  const value = speciesGroups.map(String) || [];

  if (
    sample?.metadata.useDayFlyingMothsOnly ||
    appModel.data.useDayFlyingMothsOnly
  )
    value.push(DAY_FLYING_MOTHS);

  const options: CheckboxOption[] = Object.values(groups).map(
    ({ id, prefix, label }) => ({ value: `${id}`, prefix, label })
  );

  if (speciesGroups?.includes(groups.moths.id)) {
    options.splice(2, 0, {
      value: DAY_FLYING_MOTHS,
      label: 'Use only day-flying moths',
      className: 'w-[85%] ml-auto',
    });
  }

  return (
    <IonModal isOpen={showModal}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <T>Species groups</T>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleModal}>
              <T>Close</T>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <Main fullscreen>
        <InfoMessage className="blue mx-3">
          Please select the species groups that you always record.
        </InfoMessage>

        <Checkbox
          className="mt-5 px-3"
          onChange={onChange}
          options={options}
          value={value}
        />
      </Main>
    </IonModal>
  );
};

export default observer(FiltersModal);
