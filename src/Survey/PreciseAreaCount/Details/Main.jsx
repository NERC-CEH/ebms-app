import { observer } from 'mobx-react';
import React from 'react';
import { IonList, IonItemDivider, IonLabel } from '@ionic/react';
import {
  clipboardOutline,
  thermometerOutline,
  cloudyOutline,
} from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import PropTypes from 'prop-types';
import { Main, MenuAttrItem, PhotoPicker, MenuNoteItem } from '@apps';
import ImageModel from 'common/models/media';
import config from 'config';
import 'common/images/wind.svg';

@observer
class Component extends React.Component {
  static propTypes = {
    sample: PropTypes.object.isRequired,
  };

  render() {
    const { sample } = this.props;
    const isDisabled = sample.isDisabled();
    const {
      comment,
      cloud,
      temperature,
      windDirection,
      windSpeed,
    } = sample.attrs;
    const baseURL = `/survey/area/${sample.cid}/edit/details`;

    return (
      <Main>
        <IonList lines="full">
          <IonItemDivider>
            <IonLabel>
              <T>Weather Conditions</T>
            </IonLabel>
          </IonItemDivider>

          <MenuAttrItem
            routerLink={`${baseURL}/temperature`}
            disabled={isDisabled}
            icon={thermometerOutline}
            label="Temperature"
            value={temperature}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/cloud`}
            disabled={isDisabled}
            icon={cloudyOutline}
            label="Cloud"
            value={cloud}
            skipValueTranslation
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windDirection`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Wind Direction"
            value={windDirection}
          />

          <MenuAttrItem
            routerLink={`${baseURL}/windSpeed`}
            disabled={isDisabled}
            icon="/images/wind.svg"
            label="Wind Speed"
            value={windSpeed}
          />

          <IonItemDivider>
            <IonLabel>
              <T>Other</T>
            </IonLabel>
          </IonItemDivider>

          <MenuAttrItem
            routerLink={`${baseURL}/comment`}
            disabled={isDisabled}
            icon={clipboardOutline}
            label="Comment"
            value={comment}
            skipValueTranslation
          />

          <PhotoPicker
            model={sample}
            isDisabled={isDisabled}
            dataDirPath={config.dataPath}
            ImageClass={ImageModel}
          />
          <MenuNoteItem color="medium"> 
            Representative photo of where the 15 minute count was made
          </MenuNoteItem>
        </IonList>
      </Main>
    );
  }
}

export default Component;
