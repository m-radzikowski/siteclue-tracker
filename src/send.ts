import {config} from './config';
import {currentUrl} from './util';

export const send = (action: string, data: Record<string, unknown>): void => {
    // disable send that could be initiated from other places than init() function,
    // like event() function
    if (config.disable) {
        return;
    }

    const payload = JSON.stringify({
        websiteId: config.id,
        action,
        url: currentUrl(),
        ...data,
    });

    const url = `https://${config.endpoint}/collect`;

    if (navigator.sendBeacon) {
        const blob = new Blob([payload]);
        navigator.sendBeacon(url, blob);
    } else {
        const request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(payload);
    }
};
