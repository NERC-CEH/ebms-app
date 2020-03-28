import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

const PrivateRoute = ({ component, userModel, authPathname }) => {
  const routeRender = props => {
    if (userModel.hasLogIn()) {
      return React.createElement(component, props);
    }
    return (
      <Redirect
        push
        to={{
          pathname: authPathname,
          state: { from: props.location }, // eslint-disable-line
        }}
      />
    );
  };

  // eslint-disable-next-line
  return <Route render={routeRender.bind(this)} />;
};

PrivateRoute.propTypes = {
  userModel: PropTypes.object.isRequired,
  component: PropTypes.oneOfType([PropTypes.node, PropTypes.func]).isRequired,
  authPathname: PropTypes.string,
};

PrivateRoute.defaultProps = {
  authPathname: '/user/login',
};

export default PrivateRoute;
