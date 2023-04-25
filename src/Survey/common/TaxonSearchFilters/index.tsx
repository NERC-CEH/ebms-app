import { FC, useState } from 'react';
import Sample from 'models/sample';
import appModel from 'models/app';
import { IonLabel, IonButton } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import FiltersModal from './FiltersModal';
import './styles.scss';

type Props = {
  sample: Sample;
};

const Header: FC<Props> = ({ sample }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const { speciesGroups } = sample.metadata;
  const speciesGroupCount = sample.metadata.speciesGroups.length;

  const isMultiSpeciesGroupSelected = speciesGroups.length > 1;

  return (
    <>
      <FiltersModal
        toggleModal={toggleModal}
        showModal={showModal}
        sample={sample}
        appModel={appModel}
      />

      <IonButton onClick={toggleModal} className="filter-button" fill="outline">
        <IonLabel>
          <T>Groups</T>
        </IonLabel>
        {isMultiSpeciesGroupSelected && <b>({speciesGroupCount})</b>}
      </IonButton>
    </>
  );
};

export default Header;
