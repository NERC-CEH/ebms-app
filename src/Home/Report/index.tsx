import { FC, useState, useEffect } from 'react';
import {
  IonList,
  IonItem,
  IonItemDivider,
  IonLabel,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
  IonIcon,
} from '@ionic/react';
import { bookOutline, helpBuoyOutline } from 'ionicons/icons';
import appModel from 'models/app';
import { Page, Main, device, useAlert, useToast } from '@flumens';
import InfoBackgroundMessage from 'Components/InfoBackgroundMessage';
import { Trans as T } from 'react-i18next';
import { fetchSpeciesReport } from './services';
import './styles.scss';

const Report: FC = () => {
  const [species, setSpecies] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();
  const alert = useAlert();

  const showInfoGuideTip = () => {
    if (!appModel.attrs.showGuideHelpTip) {
      return;
    }

    alert({
      header: 'Tip: Finding Help',
      message: (
        <>
          <T>
            Please visit the Guide{' '}
            <IonIcon icon={bookOutline} style={{ marginBottom: '-3px' }} /> and
            Help{' '}
            <IonIcon icon={helpBuoyOutline} style={{ marginBottom: '-3px' }} />{' '}
            pages before using the app!
          </T>
        </>
      ),
      buttons: [
        {
          text: 'OK, got it',
          role: 'cancel',
          cssClass: 'primary',
        },
      ],
    });
    appModel.attrs.showGuideHelpTip = false;
    appModel.save();
  };

  const refreshReport = async () => {
    setRefreshing(true);

    try {
      const sp = await fetchSpeciesReport();
      appModel.speciesReport = [...sp] as any;
      setSpecies([...appModel.speciesReport]);
      setRefreshing(false);
    } catch (err) {
      setRefreshing(false);
      throw err;
    }
  };

  useEffect(() => {
    showInfoGuideTip();
    if (!appModel.speciesReport.length && device.isOnline) {
      refreshReport();
      return;
    }

    setSpecies([...appModel.speciesReport]);
  }, []);

  const onListRefreshPull = async (e: any) => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      e && e.detail.complete(); // refresh pull update
      return;
    }

    try {
      await refreshReport();
    } catch (err: any) {
      toast.error(err);
    }
    e && e.detail.complete(); // refresh pull update
  };

  const getUsersReportList = () => {
    // {/* <IonItemDivider>
    //           <IonLabel>{t('TOP RECORDERS')}</IonLabel>
    //         </IonItemDivider>
    //         <IonItem>
    //           <small>{t('Not enough data yet')}</small>
    //         </IonItem> */}
  };

  const getSpeciesReportList = () => {
    if (!species.length) {
      return null;
    }

    const speciesList = [...species].splice(0, 5);

    const getSpeciesEntry = (sp: any) => {
      const scientificName = sp.key;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const commonName = t(scientificName, null, true);

      return (
        <IonItem key={sp.key}>
          <IonLabel style={{ margin: 0, padding: '7px 0' }}>
            {commonName && (
              <IonLabel
                class="ion-text-wrap report-common-name-label"
                position="stacked"
              >
                <b style={{ fontSize: '1.1em' }}>{commonName}</b>
              </IonLabel>
            )}

            <IonLabel
              class="ion-text-wrap report-taxon-label"
              position="stacked"
            >
              <i>{scientificName}</i>
            </IonLabel>
          </IonLabel>
          <IonLabel slot="end" class="report-count-label">
            {sp.doc_count}
          </IonLabel>
        </IonItem>
      );
    };
    const listComponents = speciesList.map(getSpeciesEntry);

    return (
      <>
        <IonItemDivider>
          <IonLabel className="home-report-label">
            <T>Top Species from all timed counts</T>
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
          {listComponents}
        </div>
      </>
    );
  };

  const showEmptyDataMessage = () => null;

  const getReport = () => {
    if (!species.length && !refreshing) {
      return (
        <InfoBackgroundMessage>
          Sorry, no report data is available at the moment.
        </InfoBackgroundMessage>
      );
    }

    return (
      <IonList lines="none">
        {showEmptyDataMessage()}

        {getUsersReportList()}

        {getSpeciesReportList()}
      </IonList>
    );
  };

  if (!species.length && refreshing) {
    return (
      <Page id="home-report">
        <Main>
          <IonSpinner class="centered" />
        </Main>
      </Page>
    );
  }

  return (
    <Page id="home-report">
      <Main>
        <IonRefresher slot="fixed" onIonRefresh={onListRefreshPull}>
          <IonRefresherContent />
        </IonRefresher>

        {getReport()}

        {showInfoGuideTip()}
      </Main>
    </Page>
  );
};

export default Report;
