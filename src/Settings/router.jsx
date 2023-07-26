import { Route } from 'react-router-dom';
import appModel from 'models/app';
import locations from 'models/collections/locations';
import samplesCollection from 'models/collections/samples';
import userModel from 'models/user';
import Country from './Country';
import Language from './Language';
import Menu from './Menu';
import MothSurvey from './MothSurvey';
import PrimarySurvey from './PrimarySurvey';
import SpeciesGroups from './SpeciesGroups';

const MothSurveyWrap = () => <MothSurvey appModel={appModel} />;

const PrimarySurveyWrap = () => (
  <PrimarySurvey userModel={userModel} appModel={appModel} />
);
const SpeciesGroupsWrap = () => <SpeciesGroups appModel={appModel} />;
const CountryWrap = () => <Country userModel={userModel} appModel={appModel} />;
const LanguageWrap = () => (
  <Language userModel={userModel} appModel={appModel} />
);
const MenuWrap = () => (
  <Menu
    userModel={userModel}
    appModel={appModel}
    samplesCollection={samplesCollection}
    locations={locations}
  />
);

export default [
  <Route path="/settings/menu" key="/settings/menu" exact render={MenuWrap} />,
  <Route
    path="/settings/language"
    key="/settings/language"
    exact
    render={LanguageWrap}
  />,
  <Route
    path="/settings/country"
    key="/settings/country"
    exact
    render={CountryWrap}
  />,
  <Route
    path="/settings/species"
    key="/settings/species"
    exact
    render={SpeciesGroupsWrap}
  />,
  <Route
    path="/settings/primary-survey"
    key="/settings/primary-survey"
    exact
    render={PrimarySurveyWrap}
  />,
  <Route
    path="/settings/moth-survey"
    key="/settings/moth-survey"
    exact
    render={MothSurveyWrap}
  />,
];
