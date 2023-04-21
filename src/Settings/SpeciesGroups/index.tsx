import { FC } from 'react';
import { Page, Header, Main, InfoMessage } from '@flumens';
import { informationCircleOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
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
      </Main>
    </Page>
  );
};

export default SpeciesGroups;
