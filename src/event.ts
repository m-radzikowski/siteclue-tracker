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
    const handle = (element: Element, type: string, desc: string) => {
        const [category, action, label] = desc.split('/');
        element.addEventListener(type, () => {
            event(category, action, label);
        }, true);
    };

    document.querySelectorAll(`[${attrPrefix}event]`).forEach(element => {
        const value = element.getAttribute(`${attrPrefix}event`) as string;
        const [type, desc] = value.split(':');
        handle(element, type, desc);
    });
    document.querySelectorAll(`[${attrPrefix}click]`).forEach(element => {
        const value = element.getAttribute(`${attrPrefix}click`) as string;
        handle(element, 'click', value);
    });
};
