import { FC, useState } from 'react';
import { Trans as T } from 'react-i18next';
import { IonLabel, IonButton } from '@ionic/react';
import appModel from 'models/app';
import Sample from 'models/sample';
import FiltersModal from './FiltersModal';
import './styles.scss';

type Props = {
  sample: Sample;
};

const Header: FC<Props> = ({ sample }) => {
  if (!sample.metadata.speciesGroups) {
    // eslint-disable-next-line no-param-reassign
    sample.metadata.speciesGroups = appModel.attrs.speciesGroups;
    sample.save();
  }

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
          <T>Groups</T>{' '}
          {isMultiSpeciesGroupSelected && <b>({speciesGroupCount})</b>}
        </IonLabel>
      </IonButton>
    </>
  );
};

export default Header;
