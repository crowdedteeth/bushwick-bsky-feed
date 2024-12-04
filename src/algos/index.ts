import * as brooklyn from './brooklyn';
import * as bushwick from './bushwick';

export const algos = {
  [brooklyn.shortname]: brooklyn.handler,
  [bushwick.shortname]: bushwick.handler,
};
