import {send} from './send';
import {currentUrl} from './util';
import {attrPrefix} from './config';

export const event = (category: string, action: string, label?: string): void => {
    send({
        action: 'event',
        url: currentUrl(),
        category,
        eventAction: action,
        label,
    });
};

export const setupEventsFromDataAttrs = (): void => {
    document.querySelectorAll(`[${attrPrefix}event]`).forEach(element => {
        const value = element.getAttribute(`${attrPrefix}event`) as string;
        const [event, category, action, label] = value.split(':');
        element.addEventListener(event, () => {
            send({
                action: 'event',
                url: currentUrl(),
                category,
                eventAction: action,
                label,
            });
        }, true);
    });
};
