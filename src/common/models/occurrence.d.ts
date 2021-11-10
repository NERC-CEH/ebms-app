declare const appModel: {
  new (obj: any): MyInterface;
  cid: string;
  _init: any;
  attrs: any;
  save: () => any;
  metadata: any;

  media: any[];
  destroy: () => any;
  getSurvey: any;
  attrs: any;
  isDisabled: bool;
  isDisabled: () => any;

  getTaxonName?: any;
};

export default appModel;
