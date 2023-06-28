import { FC } from 'react';
import { Main, Attr } from '@flumens';
import { observer } from 'mobx-react';
import Sample from 'models/sample';
import appModel, { AppModel } from 'models/app';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
} from '@ionic/react';
import { Trans as T } from 'react-i18next';
import './styles.scss';

type Props = {
  toggleModal: () => void;
  showModal: boolean;
  sample: Sample;
  appModel: AppModel;
};

const FiltersModal: FC<Props> = ({ toggleModal, showModal, sample }) => {
  if (!sample.metadata.speciesGroups) {
    // eslint-disable-next-line no-param-reassign
    sample.metadata.speciesGroups = appModel.attrs.speciesGroups;
    sample.save();
  }

  const survey = sample.getSurvey();
  if (!survey.metadata)
    throw new Error(
      'survey.metadata.speciesGroups is missing for FiltersModal'
    );

  const { attrProps } = survey.metadata.speciesGroups.pageProps;

  const form = (
    <div id="filters-dialog-form">
      <div className="taxon-groups taxa-filter-edit-dialog-form">
        <Attr
          metadata="speciesGroups"
          model={sample}
          {...attrProps}
          info="Please select the species groups that you always record."
        />
      </div>
    </div>
  );

  return (
    <IonModal isOpen={showModal}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>
            <T>Species groups</T>
          </IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={toggleModal}>
              <T>Close</T>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <Main fullscreen>{form}</Main>
    </IonModal>
  );
};

export default observer(FiltersModal);
