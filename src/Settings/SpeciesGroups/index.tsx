import { FC } from 'react';
import { informationCircleOutline } from 'ionicons/icons';
import { Page, Header, Main, InfoMessage } from '@flumens';
import { IonList, IonIcon } from '@ionic/react';
import speciesGroupImage from './speciesGroupImage.jpg';
import './styles.scss';

// TODO: DEPRECATED
const SpeciesGroups: FC = () => {
  return (
    <Page id="speciesGroup">
      <Header title="Species groups" />
      <Main>
        <InfoMessage
          color="tertiary"
          startAddon={<IonIcon src={informationCircleOutline} />}
        >
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
