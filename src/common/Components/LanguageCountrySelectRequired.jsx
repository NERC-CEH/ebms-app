import { observer } from 'mobx-react';
import SelectCountry from 'Settings/Country';
import SelectLanguage from 'Settings/Language';
import PropTypes from 'prop-types';

const Component = ({ appModel, children }) => {
  if (!appModel.attrs.language) {
    return <SelectLanguage appModel={appModel} hideHeader />;
  }

  if (!appModel.attrs.country) {
    return <SelectCountry appModel={appModel} hideHeader />;
  }

  return children;
};

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
    PropTypes.string,
  ]),
};

export default observer(Component);
