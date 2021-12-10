type MobxArray = {
  remove(...args: any): any; // mobx
} & Array<any>;

declare const appModel: {
  new (obj: any): MyInterface;
  cid: string;
  _init: any;
  attrs: any;
  save: () => any;
  metadata: any;

  media: MobxArray;
  destroy: () => any;
  getSurvey: any;
  attrs: any;
  isDisabled: bool;
  isDisabled: () => any;

  getTaxonName?: any;
};

export default appModel;
