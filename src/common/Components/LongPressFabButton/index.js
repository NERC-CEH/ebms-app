import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonFab, IonFabList, IonIcon, IonFabButton } from '@ionic/react';
import Hammer from 'hammerjs';
import './styles.scss';

class LongPressFabButton extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    children: PropTypes.any.isRequired,
    icon: PropTypes.any.isRequired,
  };

  fabRef = React.createRef();

  _setUpNonCordovaFabButton = () => {
    const { onClick } = this.props;
    window.l = this.fabRef.current;
    const h = new Hammer(this.fabRef.current);
    h.on('press click touch tap pressup', ev => {
      ev.preventDefault();
      ev.srcEvent.stopPropagation();

      if (!['ion-fab-button', 'ion-icon'].includes(ev.target.localName)) {
        return;
      }

      ev.srcEvent.preventDefault();
      ev.srcEvent.stopImmediatePropagation();

      if (
        this.fabRef.current.activated &&
        ev.type === 'tap' &&
        ev.target.localName !== ' ion-label'
      ) {
        this.fabRef.current.close();
        return;
      }

      if (ev.type === 'tap') {
        if (this.fabRef.current.activated) {
          return;
        }

        onClick();
      }
    });
  };

  componentDidMount() {
    if (!window.cordova) {
      this._setUpNonCordovaFabButton();
      return;
    }

    const { onClick } = this.props;
    const fab = new Hammer(this.fabRef.current);
    fab.on(
      'press click touch tap touchend pressup tapstart ionBlur ionFocus',
      ev => {
        if (!['ion-fab-button', 'ion-icon'].includes(ev.target.localName)) {
          return;
        }
        ev.preventDefault();

        if (ev.type === 'press') {
          this.fabRef.current.click();
          return;
        }

        if (ev.type === 'tap') {
          this.fabRef.current.close();

          if (this.fabRef.current.activated) {
            return;
          }

          onClick();
        }
      }
    );
  }

  render() {
    const { children, icon } = this.props;

    return (
      <IonFab
        ref={this.fabRef}
        vertical="bottom"
        horizontal="center"
        slot="fixed"
      >
        <IonFabList side="top">
          <div className="fab-backdrop" />
        </IonFabList>

        <IonFabButton>
          <IonIcon icon={icon} />
        </IonFabButton>

        {children}
      </IonFab>
    );
  }
}

export default LongPressFabButton;
