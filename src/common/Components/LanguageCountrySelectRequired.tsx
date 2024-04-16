import { observer } from 'mobx-react';
import SelectCountry from '../../Settings/Country';
import SelectLanguage from '../../Settings/Language';

const LanguageCountrySelectRequired = ({ appModel, children }: any) => {
  if (!appModel.attrs.language) return <SelectLanguage hideHeader />;
  if (!appModel.attrs.country) return <SelectCountry hideHeader />;

  return children;
};

export default observer(LanguageCountrySelectRequired);
