import BaseSerializer from './serializers/base-serializer';
import URLSerializer from './serializers/url-serializer';
import Take2Serializer from './serializers/take2-serializer';
import ProductTemplateGroupSerializer from './serializers/product-template-group-serializer';


export default {
  setupDefaultSerializers(options) {
    let serializers = {};

    serializers.base = new BaseSerializer({ request: options.request });
    serializers.productTemplateGroup = new ProductTemplateGroupSerializer({ request: options.request });
    serializers.url = new URLSerializer({ request: options.request });
    serializers.take2 = new Take2Serializer({ request: options.request });

    return serializers;
  },
};
