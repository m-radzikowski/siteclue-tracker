import {initFromScriptTag} from './init';
import {onDocumentReady} from './util';
import {setupEventsFromDataAttrs} from './event';

initFromScriptTag();
onDocumentReady(setupEventsFromDataAttrs);

export {init, SiteClueOptions} from './init';
export {event} from './event';
