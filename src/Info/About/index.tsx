import { Page, Main, Header, Section } from '@flumens';
import './styles.scss';

const { P } = Section;

const Component = () => (
  <Page id="about">
    <Header title="common.about" />
    <Main id="about" className="ion-padding">
      <Section>
        <P>info.appEnablesContribute</P>
      </Section>
      <Section>
        <b>
          <P>info.appWasSupported</P>
        </b>

        <P skipTranslation>
          <ul className="ml-2 !list-disc">
            <li>
              The GloBMS project, part of UKCEH's Global Challenges programme
              (grant number NE/X006247/1) delivering National Capability for
              NERC
            </li>
            <li>
              INSPIRE project funded by the Aberdeen Group Charitable Trust (a
              registered charity in Scotland SC040877)
            </li>
            <li>
              Assessing Butterflies in Europe (ABLE) project, funded by the
              European Union
            </li>
            <li>
              Strengthening pollinator recovery through indicators and
              monitoring (SPRING) project, funded by the European Union
            </li>
            <li>
              Agroecology-TRANSECT and UGPplus. Helmholtz Centre for
              Environmental Research (UFZ, Germany).
            </li>
            <li>
              Expanding Monitoring of Butterflies for Restoration And
              Conservation across Europe 2021-2026 (EMBRACE) project, funded by
              the European Union
            </li>
          </ul>
        </P>
      </Section>
      <Section>
        <P>info.appHasBenefited</P>
        <P skipTranslation>
          <a href="https://butterfly-monitoring.net/partners">
            https://butterfly-monitoring.net/partners
          </a>
        </P>
      </Section>
    </Main>
  </Page>
);

export default Component;
