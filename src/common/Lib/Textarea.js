import PropTypes from 'prop-types';
import React from 'react';
import { IonTextarea } from '@ionic/react';
import { withTranslation } from 'react-i18next';
import StringHelp from '../helpers/string';
import Device from '../helpers/device';

class Component extends React.Component {
  input = React.createRef();

  state = { value: this.props.default || this.props.config.default };

  onChange = val => {
    this.setState({ value: val });
    const value = val && StringHelp.escape(val);
    this.props.onChange(value);
  };

  componentDidMount() {
    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
      this.input.current.onfocusout = () => {
        window.Keyboard.hide();
      };
    }
  }

  render() {
    const { t } = this.props;
    const config = this.props.config || {};
    const message = this.props.info || config.info;

    return (
      <>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        <IonTextarea
          placeholder={t('Enter more information here...')}
          value={this.state.value}
          onIonChange={e => this.onChange(e.target.value)}
          debounce={200}
          rows={8}
          autofocus
          autocapitalize
          ref={this.input}
        />
      </>
    );
  }
}

Component.propTypes = {
  default: PropTypes.string,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(Component);
