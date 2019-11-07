/**
 * Input view.
 */
import { IonItem, IonLabel, IonDatetime, IonInput } from '@ionic/react';
import DateHelp from 'helpers/date';
import Device from 'helpers/device';
import StringHelp from 'helpers/string';
import PropTypes from 'prop-types';
import React from 'react';

class Component extends React.Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.state = { value: props.default || props.config.default };

    if (props.type === 'date' && this.state.value) {
      this.state.value = DateHelp.toDateInputValue(this.state.value);
    }

    if (props.type === 'time' && this.state.value) {
      this.state.value = new Date(this.state.value).toISOString();
    }
  }

  onChange = e => {
    this.setState({ value: e.target.value });

    const value = this.processValue(e.target.value);
    if (value) {
      this.props.onChange(value);
    }
  };

  processValue = value => {
    const valid = this.validate(value);
    if (!valid) {
      return null;
    }

    if (this.props.type === 'date') {
      const date = new Date(value);
      if (DateHelp.validate(date)) {
        return date;
      }
    }

    if (this.props.type === 'time') {
      const time = new Date(value);
      return time;
    }

    return StringHelp.escape(value);
  };

  validate(value) {
    if (this.props.validate) {
      const valid = this.props.validate(value);
      if (!valid) {
        return false;
      }
    }

    if (this.props.type === 'date') {
      return DateHelp.validate(new Date(value));
    }

    return true;
  }

  componentDidMount() {
    const config = this.props.config || {};
    const type = this.props.type || config.type;
    if (type === 'date') {
      this.input.current.open();
      return;
    }

    this.input.current.focus();
    if (window.cordova && Device.isAndroid()) {
      window.Keyboard.show();
      this.input.current.onfocusout = () => {
        window.Keyboard.hide();
      };
    }
  }

  render() {
    const config = this.props.config || {};
    const type = this.props.type || config.type || 'text';

    if (type === 'date') {
      return (
        <IonItem>
          <IonLabel>DD/MM/YYYY</IonLabel>
          <IonDatetime
            ref={this.input}
            cancelText={t('Cancel')}
            doneText={t('OK')}
            displayFormat="DD/MM/YYYY"
            value={DateHelp.toDateInputValue(this.state.value)}
            onIonChange={val => {
              const dateStr = val.detail.value.split('T')[0];
              this.onChange({ target: { value: dateStr } });
            }}
          />
        </IonItem>
      );
    }

    if (type === 'time') {
      return (
        <IonItem>
          <IonLabel>{t(config.format)}</IonLabel>
          <IonDatetime
            ref={this.input}
            cancelText={t('Cancel')}
            doneText={t('OK')}
            displayFormat={config.format}
            value={this.state.value}
            onIonChange={val => {
              this.onChange({ target: { value: val.detail.value } });
            }}
          />
        </IonItem>
      );
    }

    const min = this.props.min || config.min;
    let max = this.props.max || config.max;
    if (typeof max === 'function') {
      max = max();
      if (type === 'date') {
        [max] = max.toJSON().split('T');
      }
    }
    const message = this.props.info || config.info;

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>{t(message)}</p>
          </div>
        )}
        <IonInput
          ref={this.input}
          onIonChange={this.onChange}
          type={type}
          inputmode={type}
          max={max}
          min={min}
          value={this.state.value}
          debounce={200}
          autofocus
        />
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.any,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  validate: PropTypes.func,
  max: PropTypes.any,
  min: PropTypes.any,
  type: PropTypes.string.isRequired,
};

export default Component;
