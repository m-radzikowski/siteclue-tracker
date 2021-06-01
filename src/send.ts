import {config} from './config';

export const send = (data: Record<string, unknown>, asBeacon = false): void => {
    if (config.disable) {
        return;
    }

    const url = `https://${config.endpoint}/collect`;

    if (asBeacon) {
        const blob = new Blob([JSON.stringify(data)]);
        navigator.sendBeacon(url, blob);
    } else {
        const request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(data));
    }
};
