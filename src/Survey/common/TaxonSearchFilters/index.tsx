import { useState } from 'react';
import { Trans as T } from 'react-i18next';
import { Button } from '@flumens';
import { IonLabel } from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import FiltersModal from './FiltersModal';
import './styles.scss';

type Props = {
  sample?: Sample;
};

const Header = ({ sample }: Props) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const speciesGroups =
    sample?.data.speciesGroups || appModel.data.speciesGroups;

  const isMultiSpeciesGroupSelected = speciesGroups.length > 1;

  return (
    <>
      <FiltersModal
        toggleModal={toggleModal}
        showModal={showModal}
        sample={sample}
      />

      <Button
        onPress={toggleModal}
        className="max-w-28 whitespace-nowrap px-4 py-1"
        fill="outline"
        skipTranslation
      >
        <IonLabel>
          <T>Groups</T>{' '}
          {isMultiSpeciesGroupSelected && <b>({speciesGroups.length})</b>}
        </IonLabel>
      </Button>
    </>
  );
};

export default Header;
