import { useRef } from 'react';
import { Main, Page } from 'common/flumens';
import Banner from './Banner';
import FancyButton from './FancyButton';
import background1 from './backgrounds/background.jpg';
import background2 from './backgrounds/background_2.jpg';
import background3 from './backgrounds/background_3.jpg';
import background4 from './backgrounds/background_4.jpg';
import background5 from './backgrounds/background_5.jpg';
import background6 from './backgrounds/background_6.jpg';
import background7 from './backgrounds/background_7.jpg';
import background8 from './backgrounds/background_8.jpg';
import background9 from './backgrounds/background_9.jpg';
import background10 from './backgrounds/background_10.jpg';
import baitTrapIcon from './icons/baitTrapIcon.svg';
import countIcon from './icons/countIcon.svg';
import mothIcon from './icons/mothIcon.svg';
import singleCountIcon from './icons/singleCountIcon.svg';
import transectIcon from './icons/transectIcon.svg';

const backgrounds = [
  background1,
  background2,
  background3,
  background4,
  background5,
  background6,
  background7,
  background8,
  background9,
  background10,
];

const background = backgrounds[Math.floor(Math.random() * backgrounds.length)];

const Home = () => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    // max opacity at full scroll
    const maxOpacity = 0.7;
    const progress = scrollTop / (scrollHeight - clientHeight);
    const opacity = progress * maxOpacity;

    if (overlayRef.current) overlayRef.current.style.opacity = String(opacity);
  };

  return (
    <Page id="home-home">
      <Main scrollY={false}>
        <img src={background} className="absolute size-full object-cover" />

        {/* darkening overlay that increases with scroll */}
        <div
          ref={overlayRef}
          className="absolute size-full z-30 bg-black opacity-0 pointer-events-none"
        />

        <Banner />

        <div
          className="absolute h-full w-full z-50 pt-[57vh] pb-25 overflow-scroll"
          onScroll={onScroll}
        >
          <div className="flex flex-col gap-3 max-w-4xl mx-auto px-5">
            <FancyButton
              icon={countIcon}
              label="15min Count"
              path="/survey/precise-area"
              description="Count for 15 minutes anywhere"
            />
            <FancyButton
              icon={transectIcon}
              label="eBMS Transect"
              path="/survey/transect"
              description="Walk a fixed transect"
            />
            <FancyButton
              icon={mothIcon}
              label="Moth survey"
              path="/survey/moth"
              description="Record a moth-trap survey"
            />
            <FancyButton
              icon={singleCountIcon}
              label="15min Single Species Count"
              path="/survey/precise-single-species-area"
              description="Count a single species for 15 minutes"
            />
            {window.location.href.includes('localhost:8000') && (
              <FancyButton
                icon={baitTrapIcon}
                label="Bait-trap survey"
                path="/survey/bait-trap"
                description="Record a fixed bait-trap survey"
              />
            )}
          </div>
        </div>
      </Main>
    </Page>
  );
};

export default Home;
