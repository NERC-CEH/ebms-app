import { ReactNode } from 'react';
import { observer } from 'mobx-react';
import { AppModel } from 'models/app';
import SelectCountry from '../../Settings/Country';
import SelectLanguage from '../../Settings/Language';

type Props = {
  appModel: AppModel;
  children: ReactNode;
};

const LanguageCountrySelectRequired = ({ appModel, children }: Props) => {
  if (!appModel.data.language) return <SelectLanguage hideHeader />;
  if (!appModel.data.country) return <SelectCountry hideHeader />;

  return children;
};

export default observer(LanguageCountrySelectRequired);
