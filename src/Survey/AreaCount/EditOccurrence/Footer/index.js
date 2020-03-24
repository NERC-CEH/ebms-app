import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Log from 'helpers/log';
import ImageHelp from 'helpers/image';
import showErrMsg from 'helpers/show_err_msg';
import { observer } from 'mobx-react';
import alert from 'common/helpers/alert';
import actionSheet from 'common/helpers/actionSheet';
import { PhotoSwipe } from 'react-photoswipe';
import { IonIcon, IonButton, IonFooter } from '@ionic/react';
import { close, camera } from 'ionicons/icons';
import ImageModel from 'common/models/image';
import 'react-photoswipe/lib/photoswipe.css';
import 'react-photoswipe/dist/default-skin.svg';
import './styles.scss';

function photoDelete(photo) {
  alert({
    header: t('Delete'),
    message: `${t(
      `Are you sure you want to remove this photo from the sample?`
    )}
       </br></br> 
       ${t('Note: it will remain in the gallery.')}
       `,
    buttons: [
      {
        text: t('Cancel'),
        role: 'cancel',
        cssClass: 'primary',
      },
      {
        text: t('Delete'),
        cssClass: 'secondary',
        handler: () => {
          // show loader
          photo.destroy({
            success: () => {
              Log('Samples:Edit:Controller: photo deleted.');
            },
          });
        },
      },
    ],
  });
}

/**
 * Adds a new image to occurrence.
 */
function addPhoto(occurrence, photo) {
  return ImageHelp.getImageModel(ImageModel, photo).then(image => {
    occurrence.addMedia(image);
    return occurrence.save();
  });
}

@observer
class Footer extends Component {
  static propTypes = {
    occurrence: PropTypes.object.isRequired,
    isDisabled: PropTypes.bool,
  };

  state = {
    showGallery: false,
  };

  constructor(props) {
    super(props);
    this.photoSelect = this.photoSelect.bind(this);
    this.photoUpload = this.photoUpload.bind(this);
  }

  photoUpload(e) {
    Log('Samples:Edit:Footer: photo uploaded.');
    const photo = e.target.files[0];

    const { occurrence } = this.props;
    // TODO: show loader
    addPhoto(occurrence, photo).catch(err => {
      Log(err, 'e');
      // TODO: show err
    });
  }

  photoSelect() {
    Log('Samples:Edit:Controller: photo selection.');
    const { occurrence, isDisabled } = this.props;

    if (isDisabled) {
      return;
    }

    const onGallerySelect = () => {
      ImageHelp.getImage({
        sourceType: window.Camera.PictureSourceType.PHOTOLIBRARY,
        saveToPhotoAlbum: false,
      })
        .then(entry => {
          entry &&
            addPhoto(occurrence, entry.nativeURL, occErr => {
              if (occErr) {
                showErrMsg(occErr);
              }
            });
        })
        .catch(showErrMsg);
    };

    const onCameraSelect = () => {
      ImageHelp.getImage()
        .then(entry => {
          entry &&
            addPhoto(occurrence, entry.nativeURL, occErr => {
              if (occErr) {
                showErrMsg(occErr);
              }
            });
        })
        .catch(showErrMsg);
    };
    
    actionSheet({
      header: t('Choose a method to upload a photo'),
      buttons: [
        {
          text: t('Gallery'),
          icon: 'images',
          handler: onGallerySelect,
        },
        {
          text: t('Camera'),
          icon: 'camera',
          handler: onCameraSelect,
        },
      ],
    });
  }

  getGallery = () => {
    Log('Samples:Edit:Footer: photo view.');
    const { occurrence } = this.props;
    const { showGallery } = this.state;
    const { media } = occurrence;

    const items = [];

    media.forEach(image => {
      items.push({
        src: image.getURL(),
        w: image.get('width') || 800,
        h: image.get('height') || 800,
      });
    });

    return (
      <PhotoSwipe
        isOpen={!!showGallery}
        items={items}
        options={{
          index: showGallery - 1,
          shareEl: false,
          fullscreenEl: false,
        }}
        onClose={() => this.setState({ showGallery: false })}
      />
    );
  };

  getImageDeleteButton = img => {
    const { isDisabled } = this.props;

    if (isDisabled) {
      return null;
    }

    return (
      <IonButton fill="clear" class="delete" onClick={() => photoDelete(img)}>
        <IonIcon icon={close} />
      </IonButton>
    );
  };

  getImageArray = () => {
    const { occurrence } = this.props;
    const { models } = occurrence.media;
    if (!models || !models.length) {
      return (
        <span className="empty"> 
          {' '}
          {t('No photo has been added')}
        </span>
      );
    }

    /* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */
    const getImage = (img, index) => {
      const thumbnail = img.get('thumbnail');
      const id = img.cid;

      return (
        <div key={id} className="img">
          {this.getImageDeleteButton(img)}

          <img
            src={thumbnail}
            alt=""
            onClick={() => this.setState({ showGallery: index + 1 })}
          />
        </div>
      );
    };
    /* eslint-enable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */

    return models.map(getImage);
  };

  getNewImageButton = () => {
    if (!window.cordova) {
      return (
        <>
          <IonIcon
            class="non-cordova-img-picker-logo"
            icon={camera}
            size="large"
          />
          <input type="file" accept="image/*" onChange={this.photoUpload} />
        </>
      );
    }
    return (
      <IonButton fill="clear" onClick={this.photoSelect}>
        <IonIcon icon={camera} />
      </IonButton>
    );
  };

  render() {
    return (
      <IonFooter id="edit-footer">
        {this.getGallery()}
        <div>
          <div id="img-picker-array">
            <div className="img-picker">{this.getNewImageButton()}</div>
            <div id="img-array">{this.getImageArray()}</div>
          </div>
        </div>
      </IonFooter>
    );
  }
}

export default Footer;
