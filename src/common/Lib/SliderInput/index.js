import React from 'react';
import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { IonItem, IonRange, IonButton, IonIcon } from '@ionic/react';
import { removeCircleOutline, addCircleOutline } from 'ionicons/icons';
import './styles.scss';

// http://stackoverflow.com/questions/846221/logarithmic-slider
function LogSlider(options = {}) {
  this.minpos = options.minpos || 0;
  this.maxpos = options.maxpos || 100;

  if (options.notUseLogarithmic) {
    this.notUseLogarithmic = true;
    return;
  }

  this.minlval = Math.log(options.minval || 1);
  this.maxlval = Math.log(options.maxval || 100000);

  this.scale = (this.maxlval - this.minlval) / (this.maxpos - this.minpos);
}

LogSlider.prototype = {
  // Calculate value from a slider position
  value(position) {
    if (this.notUseLogarithmic) {
      return position;
    }

    return Math.floor(
      Math.exp((position - this.minpos) * this.scale + this.minlval)
    );
  },
  // Calculate slider position from a value
  position(value) {
    if (this.notUseLogarithmic) {
      return value;
    }

    return Math.floor(
      this.minpos + (Math.log(value) - this.minlval) / this.scale
    );
  },
};

class Component extends React.Component {
  sliderRef = React.createRef();

  inputRef = React.createRef();

  logsl = new LogSlider({
    maxpos: 100,
    minval: this.props.config.min || 1,
    maxval: this.props.config.max || 500,
    notUseLogarithmic: this.props.config.max <= 100,
  });

  state = {
    value: this.props.default,
    position: this.logsl.position(this.props.default || 1).toFixed(0),
  };

  onChangeInputE = e => {
    const { value } = e.target;

    if (value > this.props.config.max) {
      return;
    }

    this.onChangeInput(value);
  };

  onChangeInput = val => {
    let value = parseInt(val, 10);
    let position = null;
    if (!Number.isNaN(value)) {
      position = value >= 0 ? this.logsl.position(value) : null;
    } else {
      value = null;
    }

    if (this.state.sliderUpdating) {
      this.setState({ value, sliderUpdating: false });
    } else {
      this.setState({ position, value, inputUpdating: true });
      this.props.onChange(value);
    }
  };

  onChangeSlider = e => {
    let position = parseInt(e.target.value, 10);
    if (Number.isNaN(position)) {
      position = null;
    }

    const value = position >= 0 ? this.logsl.value(position) : null;
    if (this.state.inputUpdating) {
      this.setState({ position, inputUpdating: false });
    } else {
      this.setState({ position, value, sliderUpdating: true });
      this.props.onChange(value);
    }
  };

  componentDidMount() {
    this.sliderRef.current.addEventListener('ionChange', this.onChangeSlider);
    this.inputRef.current.addEventListener('ionChange', this.onChangeInputE);
  }

  componentWillUnmount() {
    this.sliderRef.current.removeEventListener(
      'ionChange',
      this.onChangeSlider
    );
    this.inputRef.current.removeEventListener('ionChange', this.onChangeInputE);
  }

  increaseCount = () => {
    const val = this.state.value || 0;
    const newVal = val + 1;

    if (newVal > this.props.config.max) {
      return;
    }

    this.onChangeInput(newVal);
  };

  decreaseCount = () => {
    const val = this.state.value || 0;
    if (val <= 1) {
      return;
    }
    this.onChangeInput(val - 1);
  };

  render() {
    const config = this.props.config || {};
    const message = this.props.info || config.info;

    return (
      <div>
        {message && (
          <div className="info-message">
            <p>
              <T>{message}</T>
            </p>
          </div>
        )}
        <IonItem className="slider-input">
          <IonRange
            ref={this.sliderRef}
            min="0"
            max="100"
            onChange={this.onChangeSlider}
            value={this.state.position}
          />
          <IonButton
            shape="round"
            fill="clear"
            size="default"
            className="decrement-button"
            onClick={this.decreaseCount}
          >
            <IonIcon icon={removeCircleOutline} />
          </IonButton>
          <input
            ref={this.inputRef}
            type="number"
            onChange={this.onChangeInputE}
            value={this.state.value || ''}
          />
          <IonButton
            shape="round"
            fill="clear"
            size="default"
            className="increment-button"
            onClick={this.increaseCount}
          >
            <IonIcon icon={addCircleOutline} />
          </IonButton>
        </IonItem>
      </div>
    );
  }
}

Component.propTypes = {
  default: PropTypes.number,
  config: PropTypes.any.isRequired,
  info: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

export default Component;
