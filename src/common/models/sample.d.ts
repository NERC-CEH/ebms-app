declare const appModel: {
  new (obj: any): MyInterface;

  _init: any;

  id: string | number;
  cid: string;
  cid: any;

  attrs: any;
  metadata: any;
  samples: any[];
  occurrences: any[];
  media: any[];
  remote: {
    synchronising: boolean;
  };
  error: {
    message: string;
  };
  save: () => any;
  upload: () => any;
  cleanUp: () => any;
  validateRemote: () => any;
  isUploaded: () => boolean;
  isDisabled: () => boolean;
  getSurvey: () => any;
  destroy: () => any;
  getPrettyName: () => string;
  isVolunteerSurvey: () => boolean;
  getTotalSubstrate: () => number;
  validateRemote: () => any;
  GPS: (callback?: any) => any;
  stopGPS: () => any;
  isGPSRunning: () => boolean;
};

export default appModel;
