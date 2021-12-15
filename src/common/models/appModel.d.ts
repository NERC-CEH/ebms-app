declare const surveyDraftKeys: {
  'draftId:precise-area'?: string;
  'draftId:precise-single-species-area'?: string;
  'draftId:transect'?: string;
  'draftId:moth'?: string | null;
};

declare const appModel: {
  _init: any;
  attrs: {
    showedWelcome: boolean;
    language: string | null;
    country: any;
    useTraining: boolean;
    feedbackGiven: boolean;
    areaSurveyListSortedByTime: boolean;

    draftIdKey: any;
    speciesGroups: string[];
    transects: any;
    primarySurvey: any;
    useImageIdentifier: boolean;
    useExperiments: boolean;
    sendAnalytics: boolean;
    appSession: any;
    showGuideHelpTip: boolean;
    showSurveysDeleteTip: boolean;
    showSurveyUploadTip: boolean;
    showCopySpeciesTip: boolean;
  } & surveyDraftKeys;
  save: () => any;
};

export default appModel;
