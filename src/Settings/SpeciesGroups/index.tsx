import { FC } from 'react';
import { Page, Header, Main, InfoMessage } from '@flumens';
import { informationCircleOutline } from 'ionicons/icons';
import { IonList } from '@ionic/react';
import { Trans as T } from 'react-i18next';
import speciesGroupImage from './speciesGroupImage.jpg';
import './styles.scss';

// TODO: DEPRECATED
const SpeciesGroups: FC = () => {
  return (
    <Page id="speciesGroup">
      <Header title="Species groups" />
      <Main>
        <InfoMessage className="blue" icon={informationCircleOutline}>
          <T>This option was moved to the species search page.</T>
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
