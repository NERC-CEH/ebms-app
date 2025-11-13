import axios, { AxiosResponse } from 'axios';
import { and, eq } from 'drizzle-orm';
import { QueryBuilder } from 'drizzle-orm/sqlite-core';
import config from 'common/config';
import { getLanguageIso } from 'common/config/languages';
import { speciesStore } from 'common/models/store';
import appModel from 'models/app';
import userModel from 'models/user';

type Result = {
  classifier_id: string;
  classifier_name: string;
  probability: number;
  group: number;
  taxon: string;
  authority: string;
  language_iso: string;
  preferred: string;
  preferred_taxon: string;
  preferred_authority: string;
  /**
   * @deprecated this comes from the server which might differ from the app ones
   */
  default_common_name: string; // not using this one
  taxa_taxon_list_id: string;
  taxon_meaning_id: string;
};

type ResultWithCommonName = Result & {
  warehouse_id: number;
  found_in_name: string;
  scientific_name: string;
  common_name?: string;
};

async function getCommonName(sp: Result) {
  const language = getLanguageIso(appModel.data.language);

  const query: any = new QueryBuilder()
    .select()
    .from(speciesStore.table)
    .where(
      and(
        eq(
          speciesStore.table.preferred_taxa_taxon_list_id,
          parseInt(sp.taxa_taxon_list_id, 10)
        ),
        eq(speciesStore.table.language_iso, language)
      )
    )
    .limit(1);

  const [taxon] = await speciesStore.db.query(query.toSQL());
  if (!taxon) return {};

  return {
    common_name: taxon.taxon,
    found_in_name: 'common_name',
  };
}

export default async function identify(
  url: string
): Promise<ResultWithCommonName[]> {
  const data = new URLSearchParams({ image: url });

  const params = new URLSearchParams({
    _api_proxy_uri: 'identify-proxy/v1/?app_name=uni-jena',
  });

  const options: any = {
    method: 'post',
    params,
    url: `${config.backend.url}/api-proxy/waarneming`,
    // url: 'https://butterfly-monitoring.net/api-proxy/waarneming',
    headers: {
      Authorization: `Bearer ${await userModel.getAccessToken()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data,
    timeout: 80000,
  };

  try {
    const response: AxiosResponse<Result[]> = await axios(options);

    const withValidData = (sp: Result) => sp.taxa_taxon_list_id && sp.taxon;

    const normalizeBaseValues = (sp: Result) => ({
      ...sp,
      warehouse_id: parseInt(sp.taxa_taxon_list_id, 10),
      scientific_name: sp.taxon,
      found_in_name: 'scientific_name',
    });

    const normalized = response.data
      .filter(withValidData)
      .map(normalizeBaseValues);

    // attach common names asynchronously
    const attachCommonName = async (sp: any) => ({
      ...sp,
      ...(await getCommonName(sp)),
    });

    const suggestions = await Promise.all(normalized.map(attachCommonName));

    return suggestions;
  } catch (e: any) {
    console.error(e);
  }

  return [];
}
