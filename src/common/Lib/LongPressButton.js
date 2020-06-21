import React from 'react';
import PropTypes from 'prop-types';
import { IonButton } from '@ionic/react';
import Hammer from 'hammerjs';

class Button extends React.Component {
  static propTypes = {
    onClick: PropTypes.func,
    onLongClick: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node,
    ]),
  };

  buttonRef = React.createRef();

  componentDidMount() {
    const { onClick, onLongClick } = this.props;

    this.hammerButton = new Hammer(this.buttonRef.current);
    this.hammerButton.on('press click tap', e => {
      if (e.type === 'tap') {
        onClick();
        return;
      }

      if (e.type === 'press') {
        onLongClick();
      }
    });
  }

  componentWillUnmount() {
    this.hammerButton.off('press click tap');
  }

  render() {
    const { children, onClick, ...props } = this.props;
    return (
      <IonButton ref={this.buttonRef} {...props}>
        {children}
      </IonButton>
    );
  }
}

export default Button;
