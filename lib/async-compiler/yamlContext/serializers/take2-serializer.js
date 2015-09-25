import URLSerializer from './url-serializer';
import _ from 'lodash';


export default class extends URLSerializer {

  normalize(response, options) {
    const nestedItems = this.nestDataItems(response);
    return super.normalize(nestedItems, options);
  }


  nestDataItems(response) {
    if (!response.data) {
      // No JSON API? return as is
      return response;
    }

    return _.map(response.data, item => {
      const relationships = item.relationships;

      delete item.relationships;

      _.forEach(relationships, (value, key) => {
        const relatedItem = this.findInRelationships(response, value.data.type, value.data.id);

        if (relatedItem) {
          item[key] = relatedItem;
        }
      });

      return item;
    });
  }


  findInRelationships(response, type, id) {
    return _.find(response.included, item => {
      return item.type === type && `${item.id}` === `${id}`;
    });
  }

}
