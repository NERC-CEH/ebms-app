import { useState, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Page, device, useToast } from '@flumens';
import { AppModel } from 'models/app';
import { UserModel } from 'models/user';
import Main from './Main';
import { fetchSpeciesReport, fetchUserSpeciesReport } from './services';
import './styles.scss';

type Props = {
  appModel: AppModel;
  userModel: UserModel;
};

const Report = ({ appModel, userModel }: Props) => {
  const [species, setSpecies] = useState<any>([]);
  const [userSpecies, setUserSpecies] = useState<any>([]);
  const [userSpeciesLastMonth, setUserSpeciesLastMonth] = useState<any>([]);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const isLoggedIn = userModel.isLoggedIn();

  const refreshReport = async () => {
    if (!device.isOnline) {
      toast.warn("Sorry, looks like you're offline.");
      return;
    }

    setRefreshing(true);

    const requests = [];

    let promise = fetchSpeciesReport().then(data => {
      // eslint-disable-next-line no-param-reassign
      appModel.speciesReport = [...data] as any;
      setSpecies([...appModel.speciesReport]);
    });

    requests.push(promise);

    const isVerified = await userModel.checkActivation();
    if (userModel.isLoggedIn() && isVerified) {
      promise = fetchUserSpeciesReport().then(data => {
        userModel.userSpeciesReport.clear();
        userModel.userSpeciesReport.push(...data);
        setUserSpecies([...userModel.userSpeciesReport]);
      });

      requests.push(promise);

      promise = fetchUserSpeciesReport(true).then(data => {
        userModel.userSpeciesLastMonthReport.clear();
        userModel.userSpeciesLastMonthReport.push(...data);
        setUserSpeciesLastMonth([...userModel.userSpeciesLastMonthReport]);
      });
      requests.push(promise);
    }

    Promise.all(requests)
      .catch(toast.error)
      .finally(() => setRefreshing(false));
  };

  useEffect(() => {
    setSpecies(appModel.speciesReport);
    setUserSpecies(userModel.userSpeciesReport);
    setUserSpeciesLastMonth(userModel.userSpeciesLastMonthReport);

    const hasAllReportData =
      species.length && userSpecies.length && userSpeciesLastMonth.length;

    if (hasAllReportData || !device.isOnline) return;

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
