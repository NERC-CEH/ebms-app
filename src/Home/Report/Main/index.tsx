import { FC } from 'react';
import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Main } from '@flumens';
import {
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/react';
import userModel from 'models/user';
import ExpandableList from 'Components/ExpandableList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import SpeciesEntry from './SpeciesEntry';

interface Props {
  species: any;
  userSpecies: any;
  userSpeciesLastMonth: any;
  refreshing: any;
  refreshReport: any;
}

const MainReport: FC<Props> = ({
  species,
  userSpecies,
  userSpeciesLastMonth,
  refreshing,
  refreshReport,
}) => {
  const hasNoData =
    !species.length && !userSpeciesLastMonth.length && !userSpecies.length;
  if (hasNoData && refreshing) {
    return (
      <Main>
        <IonSpinner class="centered" />
      </Main>
    );
  }

  const onListRefreshPull = async (e: any) => {
    await refreshReport();
    e?.detail?.complete(); // refresh pull update
  };

  const getReportTable = (data: any, label: string) => {
    if (!data.length) return null;

    const speciesList = [...data];

    const getSpeciesEntry = (sp: any) => (
      <SpeciesEntry key={sp.key} species={sp} />
    );

    const listComponents = speciesList.map(getSpeciesEntry);

    return (
      <>
        <IonItemDivider>
          <IonLabel className="home-report-label" color="dark">
            <T>{label}</T>
          </IonLabel>
        </IonItemDivider>
        <div className="rounded">
          <IonItem lines="full" className="list-header-labels">
            <IonLabel>
              <small>
                <T>Species</T>
              </small>
            </IonLabel>
            <IonLabel class="ion-text-right">
              <small>
                <T>Counts</T>
              </small>
            </IonLabel>
          </IonItem>

          <ExpandableList>{listComponents}</ExpandableList>
        </div>
      </>
    );
  };

  if (hasNoData && !refreshing) {
    return (
      <InfoBackgroundMessage>
        Sorry, no report data is available at the moment.
      </InfoBackgroundMessage>
    );
  }

  const isLoggedIn = userModel.isLoggedIn();

  return (
    <Main>
      <IonRefresher slot="fixed" onIonRefresh={onListRefreshPull}>
        <IonRefresherContent />
      </IonRefresher>

      <IonList lines="none">
        {!isLoggedIn && (
          <InfoBackgroundMessage>
            Please login to see your own data report.
          </InfoBackgroundMessage>
        )}

        {isLoggedIn &&
          getReportTable(userSpeciesLastMonth, 'Your top species this month')}
        {isLoggedIn && getReportTable(userSpecies, 'Your top species')}

        {getReportTable(species, 'Top Species from all timed counts')}
      </IonList>
    </Main>
  );
};

export default observer(MainReport);
