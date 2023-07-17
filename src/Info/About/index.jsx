import PropTypes from 'prop-types';
import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Section } from '@flumens';
import './styles.scss';

const { P } = Section;

const Component = ({ appModel }) => {
  const isEnglish = appModel.attrs.language === 'en';

  return (
    <Page id="about">
      <Header title="About" />
      <Main id="about" className="ion-padding">
        {isEnglish ? (
          <Section>
            <P>
              This app enables you to contribute to the recording and
              conservation of Europe’s butterflies. The app is not part of the
              Big Butterfly Count that is run in the UK by Butterfly
              Conservation each summer. Please visit their{' '}
              <a href="https://www.bigbutterflycount.org/">project website</a>{' '}
              for information on how to get involved in that survey. Data
              collected through this ButterflyCount app is shared with UK
              Butterfly Conservation (and other Butterfly Conservation Europe
              partners) to support their monitoring and conservation work.
            </P>
          </Section>
        ) : (
          <Section>
            <P>
              This app contributes data to the European Butterfly Monitoring
              Scheme (eBMS).
            </P>
          </Section>
        )}

        <Section>
          <P>
            The app was developed as part of the Assessing Butterflies in Europe
            (ABLE) project.
          </P>
        </Section>

        <Section>
          <P skipTranslation>
            <T>The ABLE project is a partnership between</T>{' '}
            <a href="http://www.bc-europe.eu/">Butterfly Conservation Europe</a>
            ,{' '}
            <a href="www.ceh.ac.uk">
              the Centre for Ecology and Hydrology (UK)
            </a>
            ,{' '}
            <a href="https://www.ufz.de/index.php">
              the Helmholtz Centre for Environmental Research (UFZ, Germany) -
              Josef Settele, Oliver Schweiger
            </a>
            ,{' '}
            <a href="https://www.vlinderstichting.nl/">
              Dutch Butterfly Conservation
            </a>{' '}
            <T>and</T>{' '}
            <a href="https://butterfly-conservation.org/">
              Butterfly Conservation (UK)
            </a>
            .{' '}
          </P>
        </Section>
      </Main>
    </Page>
  );
};

Component.propTypes = {
  appModel: PropTypes.object.isRequired,
};

export default Component;
