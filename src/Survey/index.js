import React from 'react';
import { Route } from 'react-router-dom';
import appModel from 'app_model';
import userModel from 'user_model';
import savedSamples from 'saved_samples';
import Edit from './AreaCount/Edit';
import EditOccurrence from './AreaCount/EditOccurrence';
import Taxon from './AreaCount/Taxon';
import AreaAttr from './AreaCount/Area';
import TimeAttr from './AreaCount/Time';
import Comment from './AreaCount/Comment';

const App = () => (
  <>
    <Route
      path="/survey/:id/edit/area"
      exact
      render={props => <AreaAttr savedSamples={savedSamples} {...props} />}
    />
    <Route
      path="/survey/:id/edit/time"
      exact
      render={props => <TimeAttr savedSamples={savedSamples} {...props} />}
    />
    <Route
      path="/survey/:id/edit/taxa"
      exact
      render={props => <Taxon savedSamples={savedSamples} {...props} />}
    />

    <Route
      path="/survey/:id/edit"
      exact
      render={props => <Edit savedSamples={savedSamples} {...props} />}
    />
    <Route
      path="/survey/:id/edit/occ/:occId"
      exact
      render={props => (
        <EditOccurrence savedSamples={savedSamples} {...props} />
      )}
    />
    <Route
      path="/survey/:id/edit/occ/:occId/taxa"
      exact
      render={props => <Taxon savedSamples={savedSamples} {...props} />}
    />
    <Route
      path="/survey/:id/edit/occ/:occId/comment"
      exact
      render={props => <Comment savedSamples={savedSamples} {...props} />}
    />
  </>
);

export default App;
