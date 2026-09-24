/* eslint-disable local/valid-trans-key */
import { Trans as T } from 'react-i18next';
import { Page, Main, Header, Section } from '@flumens';
import { IonItem, IonLabel } from '@ionic/react';
import species, { Species } from 'common/data/profiles';
import ExpandableList from 'Components/ExpandableList';
import flumensLogo from './flumens.png';
import sponsorsLogo from './sponsors.png';
import './styles.scss';

const { P, H } = Section;

const speciesWithImageCopyright = (s: Species) => s.imageCopyright;
const getTaxonWithImageCopyright = (s: Species) => (
  <IonItem key={s.id} lines="none">
    <IonLabel>
      <i>{`${s.taxon}: `}</i>
      <span
        dangerouslySetInnerHTML={{ __html: s.imageCopyright?.join(', ') || '' }}
      />
    </IonLabel>
  </IonItem>
);

const Credits = () => (
  <Page id="credits">
    <Header title="common.credits" />
    <Main className="ion-padding">
      <Section>
        <img src={sponsorsLogo} alt="" className="mx-auto" />
      </Section>

      <Section>
        <H>info.weVeryGrateful</H>
        <IonItem>
          <IonLabel>
            <b>David Roy</b> (UK Centre for Ecology & Hydrology)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Karolis Kazlauskis</b> (Flumens)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Steve Woodhall</b> (Lepsoc Africa)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Yasuhiro Nakamura</b> (Japan Butterfly Conservation)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Jaqui Knight</b> (Moths and Butterflies of NZ Trust)
          </IonLabel>
        </IonItem>

        <IonItem>
          <IonLabel>
            <b>Cristina G. Sevilleja</b> (Dutch Butterfly Conservation,
            Butterfly Conservation Europe)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Chris van Swaay</b> (Dutch Butterfly Conservation, Butterfly
            Conservation Europe)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Irma Wynhoff</b> (Dutch Butterfly Conservation, Butterfly
            Conservation Europe)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Martin Warren</b> (Butterfly Conservation Europe)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Guy Pe’er</b> (German Centre for Integrative Biodiversity
            Research)
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Biren Rathod</b> (UK Centre for Ecology & Hydrology)
          </IonLabel>
        </IonItem>
      </Section>

      <Section>
        <P>info.ugpProjectCitizens</P>
        <IonItem>
          <a
            href="https://flumens.io"
            aria-label="Flumens link"
            className="w-full max-w-[200px] mx-auto"
          >
            <img src={flumensLogo} alt="" />
          </a>
        </IonItem>
        <P skipTranslation>
          <T i18nKey="info.flumensCredit">
            This app was handcrafted with love by
            <a href="https://flumens.io" style={{ whiteSpace: 'nowrap' }}>
              {' '}
              Flumens,
            </a>{' '}
            an agency specialising in building bespoke data-oriented solutions.
            For suggestions and feedback please do not hesitate to{' '}
            <a href="mailto:apps%40ceh.ac.uk?subject=ButterflyCount%20App">
              contact us
            </a>
            .
          </T>
        </P>
      </Section>

      <Section>
        <H>info.partners</H>
        <IonItem>
          <IonLabel>
            <b>Butterfly Conservation Europe</b> – Sue Collins, Martin Warren
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>UK Centre for Ecology and Hydrology (UKCEH, UK)</b> – David Roy,
            Reto Schmucki
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Africa Lepidoptera Society</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Japan Butterfly Conservation</b>
          </IonLabel>
        </IonItem>
        <IonItem>
          <IonLabel>
            <b>Moths and Butterflies of NZ Trust</b>
          </IonLabel>
        </IonItem>
      </Section>

      <Section>
        <H>info.speciesDescriptions</H>
        <P>info.speciesDescriptionCredits</P>
      </Section>

      <Section>
        <H>info.weatherConditions</H>
        <P>info.currentWeatherValues</P>
      </Section>

      <Section>
        <H>info.photoCredits</H>

        <ExpandableList>
          {species
            .filter(speciesWithImageCopyright)
            .map(getTaxonWithImageCopyright)}
        </ExpandableList>
      </Section>

      <Section>
        <H>info.iconsMadeBy</H>
        <IonItem lines="none">
          <IonLabel>
            <a
              href="https://www.flaticon.com/authors/vitaly-gorbachev"
              title="Vitaly Gorbachev"
            >
              Vitaly Gorbachev
            </a>
            ,{' '}
            <a
              href="https://www.flaticon.com/authors/good-ware"
              title="Good Ware"
            >
              Good Ware
            </a>
            ,{' '}
            <a href="https://www.flaticon.com/authors/freepik" title="FreePick">
              FreePick
            </a>{' '}
            <T>info.from</T>{' '}
            <a href="https://www.flaticon.com/" title="Flaticon">
              www.flaticon.com
            </a>
          </IonLabel>
        </IonItem>

        <IonItem lines="none">
          <IonLabel>
            Copyright 2020 Twitter, Inc and other contributors{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/">CC-BY 4.0</a>
          </IonLabel>
        </IonItem>
      </Section>
      <Section>
        <P skipTranslation className="text-sm opacity-70">
          * <T>info.ugpStandsEnhancing</T>
        </P>
      </Section>
    </Main>
  </Page>
);

export default Credits;
