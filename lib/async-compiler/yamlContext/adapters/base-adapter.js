import RSVP from 'rsvp';
import _ from 'lodash';


export function YAMLContextAdapterException(message) {
  this.message = message;
  this.name = 'YAMLContextAdapterException';
}


export default class {

  constructor() {
    this.REQUIRED_OPTIONS = ['as'];
  }


  validateOptions(options) {
    let errorMessages = [];
    
    _.forEach(this.REQUIRED_OPTIONS, optionName => {
      if (!options[optionName]) {
        errorMessages.push(`'${optionName}' option is required.`);
      }
    });

    if (errorMessages.length > 0) {
      return RSVP.reject(errorMessages.join(' '));
    }

    return RSVP.resolve(options);
  }


  fetch(options) {
    return this.validateOptions(options);
  }

}
