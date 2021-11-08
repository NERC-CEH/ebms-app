declare const appModel: {
  new (obj: any): MyInterface;
  cid: string;
  _init: any;
  attrs: any;
  save: () => any;

  media: any[];
  destroy: () => any;
};

export default appModel;
