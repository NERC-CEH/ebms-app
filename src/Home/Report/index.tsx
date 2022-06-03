import { FC, useState, useEffect } from 'react';
import appModel from 'models/app';
import userModel from 'models/user';
import { Page, device, useToast } from '@flumens';
import { observer } from 'mobx-react';
import { fetchSpeciesReport, fetchUserSpeciesReport } from './services';
import Main from './Main';
import './styles.scss';

const Report: FC = () => {
  const [species, setSpecies] = useState<any>(appModel.speciesReport);
  const [userSpecies, setUserSpecies] = useState<any>(
    userModel.userSpeciesReport
  );
  const [userSpeciesLastMonth, setUserSpeciesLastMonth] = useState<any>(
    userModel.userSpeciesLastMonthReport
  );
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const isLoggedIn = userModel.isLoggedIn();

  const refreshReport = () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    setRefreshing(true);

    const requests = [];

    let promise = fetchSpeciesReport().then(data => {
      appModel.speciesReport = [...data] as any;
      setSpecies([...appModel.speciesReport]);
    });

    requests.push(promise);

    if (userModel.isLoggedIn()) {
      promise = fetchUserSpeciesReport().then(data => {
        userModel.userSpeciesReport = [...data] as any;
        setUserSpecies([...userModel.userSpeciesReport]);
      });

      requests.push(promise);

      promise = fetchUserSpeciesReport(true).then(data => {
        userModel.userSpeciesLastMonthReport = [...data] as any;
        setUserSpeciesLastMonth([...userModel.userSpeciesLastMonthReport]);
      });
      requests.push(promise);
    }

    Promise.all(requests)
      .catch(toast.error)
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    const reportDataMissing =
      !appModel.speciesReport.length ||
      !userModel.userSpeciesReport.length ||
      !userModel.userSpeciesLastMonthReport.length;
    if (!reportDataMissing || !device.isOnline) return;

    refreshReport();
  }, [isLoggedIn]);

  return (
    <Page id="home-report">
      <Main
        species={species}
        userSpecies={userSpecies}
        userSpeciesLastMonth={userSpeciesLastMonth}
        refreshing={refreshing}
        refreshReport={refreshReport}
      />
    </Page>
  );
};

export default observer(Report);
