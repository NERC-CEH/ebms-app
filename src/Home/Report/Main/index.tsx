import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Main } from '@flumens';
import {
  IonList,
  IonItem,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  type RefresherCustomEvent,
} from '@ionic/react';
import userModel from 'models/user';
import ExpandableList from 'Components/ExpandableList';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Species } from '../services';
import SpeciesEntry from './SpeciesEntry';

type Props = {
  species: Species[];
  userSpecies: Species[];
  userSpeciesLastMonth: Species[];
  refreshing: boolean;
  refreshReport: () => Promise<void>;
};

const MainReport = ({
  species,
  userSpecies,
  userSpeciesLastMonth,
  refreshing,
  refreshReport,
}: Props) => {
  const hasNoData =
    !species.length && !userSpeciesLastMonth.length && !userSpecies.length;
  if (hasNoData && refreshing) {
    return (
      <Main>
        <IonSpinner className="w-full my-50" />
      </Main>
    );
  }

  const onListRefreshPull = async (e: RefresherCustomEvent) => {
    await refreshReport();
    e?.detail?.complete(); // refresh pull update
  };

  const getReportTable = (data: Species[], label: string) => {
    if (!data.length) return null;

    const speciesList = [...data];

    const getSpeciesEntry = (sp: Species) => (
      <SpeciesEntry key={sp.scientificName} species={sp} />
    );

    const listComponents = speciesList.map(getSpeciesEntry);

    return (
      <>
        <h3 className="list-title">
          <T i18nKey={label as never} />
        </h3>
        <div className="rounded-list bg-white">
          <IonItem lines="full" className="list-header-labels">
            <IonLabel>
              <small>
                <T>common.species</T>
              </small>
            </IonLabel>
            <IonLabel className="ion-text-right">
              <small>
                <T>reports.counts</T>
              </small>
            </IonLabel>
          </IonItem>

          <ExpandableList>{listComponents}</ExpandableList>
        </div>
      </>
    );
  };

  if (hasNoData && !refreshing) {
    return <InfoBackgroundMessage>reports.sorryNoReport</InfoBackgroundMessage>;
  }

  const isLoggedIn = userModel.isLoggedIn();

  return (
    <Main className="[--padding-top:env(safe-area-inset-top)] [--padding-bottom:30px]">
      <IonRefresher slot="fixed" onIonRefresh={onListRefreshPull}>
        <IonRefresherContent />
      </IonRefresher>

      <IonList lines="none">
        {!isLoggedIn && (
          <InfoBackgroundMessage>reports.pleaseLoginSee</InfoBackgroundMessage>
        )}

        {isLoggedIn &&
          getReportTable(userSpeciesLastMonth, 'reports.topSpeciesMonth')}
        {isLoggedIn && getReportTable(userSpecies, 'reports.topSpecies')}

        {getReportTable(species, 'reports.topSpeciesAll')}
      </IonList>
    </Main>
  );
};

export default observer(MainReport);
