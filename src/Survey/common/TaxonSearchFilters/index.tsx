import { FC, useState } from 'react';
import Sample from 'models/sample';
import appModel from 'models/app';
import { IonIcon, IonBadge } from '@ionic/react';
import { filterOutline } from 'ionicons/icons';
import FiltersModal from './FiltersModal';
import './styles.scss';

type Props = {
  sample: Sample;
};

const Header: FC<Props> = ({ sample }) => {
  const [showModal, setShowModal] = useState(false);

  const toggleModal = () => setShowModal(!showModal);

  const { speciesGroups } = sample.metadata;
  const speciesGroupCount = speciesGroups.length;

  const showBadge = speciesGroups.length > 1;

  return (
    <>
      <FiltersModal
        toggleModal={toggleModal}
        showModal={showModal}
        sample={sample}
        appModel={appModel}
      />

      <div id="species-filter">
        <IonIcon onClick={toggleModal} icon={filterOutline} />
        {showBadge && (
          <IonBadge color="warning" className="pending-surveys-badge">
            {speciesGroupCount}
          </IonBadge>
        )}
      </div>
    </>
  );
};

export default Header;
