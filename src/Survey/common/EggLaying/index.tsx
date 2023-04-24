import { FC } from 'react';
import { observer } from 'mobx-react';
import { Page, Attr, Main, Header, InfoMessage } from '@flumens';
import { informationCircleOutline } from 'ionicons/icons';
import Sample from 'models/sample';

type Props = {
  sample: Sample;
};

const EggLaying: FC<Props> = ({ sample }) => {
  const sampleConfig = sample.getSurvey();

  const { attrProps } = (sampleConfig as any).attrs.eggLaying.pageProps;

  const { attrProps: attrPropsOther } = (sampleConfig as any).attrs
    .otherEggLaying.pageProps;

  const isOtherFlowerSelected = sample.attrs.eggLaying === 'other';

  const onChange = (value: any) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.eggLaying = value;

    if (sample.attrs.eggLaying !== 'other') {
      // eslint-disable-next-line no-param-reassign
      sample.attrs.otherEggLaying = null;
      sample.save();
    }
  };

  return (
    <Page id="survey-egg-laying-page">
      <Header title="Egg laying" />

      <Main>
        <InfoMessage className="blue" icon={informationCircleOutline}>
          What was the flower?
        </InfoMessage>

        <Attr
          attr="eggLayingFlower"
          model={sample}
          onChange={onChange}
          {...attrProps}
        />

        {isOtherFlowerSelected && (
          <Attr attr="otherEggLaying" model={sample} {...attrPropsOther} />
        )}
      </Main>
    </Page>
  );
};

export default observer(EggLaying);
