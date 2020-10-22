import React from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import SelectLanguage from 'Settings/Language';
import SelectCountry from 'Settings/Country';

const Component = observer(({ appModel, children }) => {
  if (!appModel.attrs.language) {
    return <SelectLanguage appModel={appModel} hideHeader />;
  }

  if (!appModel.attrs.country) {
    return <SelectCountry appModel={appModel} hideHeader />;
  }

  return children;
});

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
};

export default Component;
