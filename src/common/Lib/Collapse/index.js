import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonItem, IonIcon, IonLabel } from '@ionic/react';
import { remove, add } from 'ionicons/icons';
import './styles.scss';

class Collapse extends Component {
  state = { open: false };

  onClick = () => {
    this.setState(prevState => ({ open: !prevState.open }));
  };

  render() {
    const { title, children } = this.props;

    return (
      <>
        <IonItem
          onClick={this.onClick}
          class={`collapse-block in-list ${this.state.open ? 'opened' : ''}`}
          lines="none"
        >
          <IonLabel class="ion-text-wrap">{title}</IonLabel>
          <IonIcon icon={this.state.open ? remove : add} slot="end" />
        </IonItem>

        {this.state.open && <IonItem>{children}</IonItem>}
      </>
    );
  }
}

Collapse.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]),
  title: PropTypes.string,
};

export default Collapse;
