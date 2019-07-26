import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { IonItem, IonIcon } from '@ionic/react';
import { remove, add } from 'ionicons/icons';
import './styles.scss';

class Collapse extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    this.setState(prevState => ({ open: !prevState.open }));
  }

  render() {
    return (
      <IonItem
        onClick={this.onClick}
        class={`collapse-block in-list hydrated item ${
          this.state.open ? 'opened' : ''
        }`}
      >
        <div className="header">{this.props.title}</div>
        <IonIcon icon={this.state.open ? remove : add} />
        {this.state.open && <div className="body">{this.props.children}</div>}
      </IonItem>
    );
  }
}

Collapse.propTypes = {
  children: PropTypes.any,
  title: PropTypes.string,
};

export default Collapse;
