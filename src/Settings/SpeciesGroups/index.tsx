import { FC } from 'react';
import { Page, Header, Main, InfoMessage } from '@flumens';
import { informationCircleOutline } from 'ionicons/icons';
import { IonList } from '@ionic/react';
import speciesGroupImage from './speciesGroupImage.jpg';
import './styles.scss';

// TODO: DEPRECATED
const SpeciesGroups: FC = () => {
  return (
    <Page id="speciesGroup">
      <Header title="Species groups" />
      <Main>
        <InfoMessage className="blue" icon={informationCircleOutline}>
          This option was moved to the species search page inside the surveys.
          When a survey starts, you can select which species group you are
          recording.
        </InfoMessage>

        <IonList lines="none">
          <div className="image-wrapper">
            <img src={speciesGroupImage} />
          </div>
        </IonList>
      </Main>
    </Page>
  );
};

export default SpeciesGroups;
