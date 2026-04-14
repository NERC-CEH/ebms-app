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
      <span dangerouslySetInnerHTML={{ __html: s.imageCopyright as any }} />
    </IonLabel>
  </IonItem>
);

const Credits = () => (
  <Page id="credits">
    <Header title="Credits" />
    <Main className="ion-padding">
      <Section>
        <img src={sponsorsLogo} alt="" className="mx-auto" />
      </Section>

      <Section>
        <H>
          We are very grateful for all the people that helped to create this
          app:
        </H>
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
        <P>
          In the UGP+ project*, citizens, policy makers and scientists work
          together to develop future plans for urban nature in Europe. Counting
          butterflies in cities is not only a great way to keep track of
          biodiversity and the quality of urban green spaces, but also to
          empower all of us to engage with questions of biodiversity, nature
          policy, and propose new actions for people and the city. The data
          contributed by participants will be analysed to inform urban
          biodiversity conservation actions across Europe.
        </P>
        <IonItem>
          <a
            href="https://flumens.io"
            aria-label="Flumens link"
            className="w-full max-w-[200px] mx-auto"
          >
            <img src={flumensLogo} alt="" />
          </a>
        </IonItem>
        <P>
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
        </P>
      </Section>

      <Section>
        <H>Partners:</H>
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
        <H>Species descriptions</H>
        <P>
          Species descriptions included as part of the guide are based on those
          produced for the Climatic Risk Atlas of European Butterflies. We thank
          Josef Settele for making these available.
        </P>
      </Section>

      <Section>
        <H>Weather conditions</H>
        <P>
          The current weather values are prepopulated using the OpenWeatherMap
          API weather service.
        </P>
      </Section>

      <Section>
        <H>Photo credits</H>

        <ExpandableList>
          {species
            .filter(speciesWithImageCopyright)
            .map(getTaxonWithImageCopyright)}
        </ExpandableList>
      </Section>

      <Section>
        <H>Icons made by</H>
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
            <T>from</T>{' '}
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
          *{' '}
          <T>
            UGP+ stands for Enhancing Urban Greening Plans to Mainstream
            Biodiversity in Society, and is a project funded by the European
            Union
          </T>
        </P>
      </Section>
    </Main>
  </Page>
);

export default Credits;
