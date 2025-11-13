import { Route } from 'react-router-dom';
import Country from './Country';
import Language from './Language';
import Menu from './Menu';
import MothSurvey from './MothSurvey';
import PrimarySurvey from './PrimarySurvey';
import SpeciesList from './SpeciesList';

export default [
  <Route path="/settings/menu" key="/settings/menu" exact component={Menu} />,
  <Route
    path="/settings/language"
    key="/settings/language"
    exact
    component={Language}
  />,
  <Route
    path="/settings/country"
    key="/settings/country"
    exact
    component={Country}
  />,
  <Route
    path="/settings/primary-survey"
    key="/settings/primary-survey"
    exact
    component={PrimarySurvey}
  />,
  <Route
    path="/settings/moth-survey"
    key="/settings/moth-survey"
    exact
    component={MothSurvey}
  />,
  <Route
    path="/settings/species-lists"
    key="/settings/species-lists"
    exact
    component={SpeciesList}
  />,
];
