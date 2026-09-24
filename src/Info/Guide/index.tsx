import { openOutline } from 'ionicons/icons';
import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Section } from '@flumens';
import { IonButton, IonIcon, IonList } from '@ionic/react';
import config from 'common/config';
import './styles.scss';

const { P, H } = Section;

const helpEmail = 'ebms@ceh.ac.uk';
const eBMSWebsiteLink = ''; // backwards compatible

const Component = () => {
  const navigateTo = () => {
    window.location.href = `${config.backend.url}/painted-lady-migration`;
  };

  return (
    <Page id="guide">
      <Header title="common.instructions" />
      <Main className="ion-padding">
        <Section>
          <H>info.howUseApp</H>
          <P>info.canUseApp</P>
          <P>info.appSupportsRange</P>
          <P>info.pollardTransectsFixed</P>
          <P>info.countMethod</P>
        </Section>

        <Section>
          <div className="painted-lady-guide" onClick={navigateTo}>
            <H>info.trackingPaintedLady</H>
            <IonIcon slot="end" icon={openOutline} className="size-5" />
          </div>
        </Section>

        <Section>
          <H>info.howDo15</H>
          <P>info.defaultMethodApp</P>
          <P>info.addSpeciesSee</P>
          <P>info.onceHaveFinished</P>
        </Section>

        <Section>
          <P>info.itAlsoPossible</P>
        </Section>

        <Section>
          <H>info.howRecordAlong</H>
          <P skipTranslation>
            <T i18nKey="info.existingTransects" values={{ helpEmail }} />
          </P>
          <P>info.startTransectCount</P>
        </Section>

        <Section>
          <H>info.surveySection</H>
          <P skipTranslation>
            <T i18nKey="info.tabRightPart">
              In this tab, on the right part of the + Button, you can see the
              PENDING counts, your records that have not been submitted and the
              UPLOADED counts, the ones submitted to the eBMS database. The
              Pending counts can be submitted to the system by clicking on it
              and pressing the Upload option. You could see the species list
              that you recorded for Uploaded counts. All your records can also
              be viewed and edited on the {{ eBMSWebsiteLink }}
            </T>
            <a
              href="https://butterfly-monitoring.net/elastic/my-records"
              target="_blank"
              rel="noopener noreferrer"
            >
              <T>common.ebmsWebsite</T>
            </a>
            .
          </P>
        </Section>

        <Section>
          <H>info.appSettings</H>
          <P>info.goApplicationSetting</P>
          <P>info.canAlsoSwitch</P>
        </Section>

        <IonList>
          <IonButton
            href={`${config.backend.url}/ebms-app`}
            fill="outline"
            className="rounded-lg"
          >
            <IonIcon slot="end" icon={openOutline} />
            <T>info.moreInformation</T>
          </IonButton>
        </IonList>
      </Main>
    </Page>
  );
};

export default Component;
