declare const appModel: {
  _init: any;
  attrs: any;
  identification: {
    identifying: boolean;
  };
  identify: () => any;
  upload: () => any;
  doesTaxonMatchParent: () => boolean;
};

export default appModel;
