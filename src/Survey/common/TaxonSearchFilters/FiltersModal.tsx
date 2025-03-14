import { observer } from 'mobx-react';
import { Trans as T } from 'react-i18next';
import { Main, Attr } from '@flumens';
import {
  IonButtons,
  IonToolbar,
  IonHeader,
  IonTitle,
  IonButton,
  IonModal,
} from '@ionic/react';
import appModel, { AppModel } from 'models/app';
import Sample from 'models/sample';
import './styles.scss';

type Props = {
  toggleModal: () => void;
  showModal: boolean;
  sample: Sample;
  appModel: AppModel;
};

const FiltersModal = ({ toggleModal, showModal, sample }: Props) => {
  if (!sample.metadata.speciesGroups) {
    // eslint-disable-next-line no-param-reassign
    sample.metadata.speciesGroups = appModel.data.speciesGroups;
    sample.save();
  }

  const survey = sample.getSurvey();
  if (!survey.metadata)
    throw new Error(
      'survey.metadata.speciesGroups is missing for FiltersModal'
    );

  const { attrProps } = survey.metadata.speciesGroups.pageProps;

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
      <Main fullscreen>
        <Attr
          metadata="speciesGroups"
          model={sample}
          {...attrProps}
          className="mt-5 px-3"
          info="Please select the species groups that you always record."
        />
      </Main>
    </IonModal>
  );
};

export default observer(FiltersModal);
