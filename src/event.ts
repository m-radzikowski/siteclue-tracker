import {send} from './send';
import {attrPrefix} from './config';

export const event = (category: string, action: string, label?: string): void => {
    send('event', {
        category,
        eventAction: action,
        label,
    });
};

export const setupEventsFromDataAttrs = (): void => {
    document.querySelectorAll(`[${attrPrefix}event]`).forEach(element => {
        const value = element.getAttribute(`${attrPrefix}event`) as string;
        const [type, category, action, label] = value.split(':');
        element.addEventListener(type, () => {
            event(category, action, label);
        }, true);
    });
};
