import {send} from './send';
import {currentUrl} from './util';

export const event = (category: string, action: string, label?: string): void => {
    send({
        action: 'event',
        url: currentUrl(),
        category,
        eventAction: action,
        label,
    });
};
