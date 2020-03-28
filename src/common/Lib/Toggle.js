import React, { Component } from 'react';
import { IonToggle } from '@ionic/react';
import PropTypes from 'prop-types';

class Toggle extends Component {
  toggleRef = React.createRef();

  onToggle = e => {
    const { checked } = e.target;
    this.props.onToggle(checked);
  };

  componentDidMount() {
    this.toggleRef.current.addEventListener('ionChange', this.onToggle);
  }

  componentWillUnmount() {
    this.toggleRef.current.removeEventListener('ionChange', this.onToggle);
  }

  render() {
    const { checked, disabled, onToggle, ...props } = this.props;

    return (
      <IonToggle
        ref={this.toggleRef}
        slot="end"
        disabled={disabled}
        checked={checked}
        {...props}
      />
    );
  }
}

Toggle.propTypes = {
  onToggle: PropTypes.func.isRequired,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Toggle;
