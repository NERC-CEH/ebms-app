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

  const onChange = (value: any) => {
    // eslint-disable-next-line no-param-reassign
    sample.attrs.eggLaying = value;

    const hasOtherOptionSelected =
      sample.attrs.eggLaying && sample.attrs.eggLaying.includes('other');

    if (hasOtherOptionSelected) {
      // eslint-disable-next-line no-param-reassign
      sample.attrs.otherEggLaying = '';
    } else {
      // eslint-disable-next-line no-param-reassign
      sample.attrs.otherEggLaying = null;
    }

    sample.save();
  };

  return (
    <Page id="survey-egg-laying-page">
      <Header title="Hostplants" />

      <Main>
        <InfoMessage className="blue" icon={informationCircleOutline}>
          Please select the hostplants.
        </InfoMessage>

        <Attr
          attr="eggLayingFlower"
          onChange={onChange}
          model={sample}
          {...attrProps}
        />
        {sample.attrs.otherEggLaying !== null && (
          <Attr attr="otherEggLaying" model={sample} {...attrPropsOther} />
        )}
      </Main>
    </Page>
  );
};

export default observer(EggLaying);
