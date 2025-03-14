import { observer } from 'mobx-react';
import SelectCountry from '../../Settings/Country';
import SelectLanguage from '../../Settings/Language';

const LanguageCountrySelectRequired = ({ appModel, children }: any) => {
  if (!appModel.data.language) return <SelectLanguage hideHeader />;
  if (!appModel.data.country) return <SelectCountry hideHeader />;

  return children;
};

export default observer(LanguageCountrySelectRequired);
