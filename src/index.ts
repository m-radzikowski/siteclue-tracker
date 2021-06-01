const send = (url: string, data: Record<string, unknown>) => {
    const request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify(data));
};

const onDocumentReady = (fn: () => void) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

export const init = (id: string, {
    endpoint = 'wh1clg0ena.execute-api.eu-west-1.amazonaws.com',
}: SiteClueOptions = {}): void => {
    const disable = localStorage.getItem('SiteClue.disable') !== null;
    if (disable) {
        return;
    }

    const url = `https://${endpoint}/collect`;

    const {screen, location} = window;
    send(url, {
        action: 'view',
        url: location.origin + location.pathname,
        referrer: document.referrer,
        screen: {
            w: screen.width,
            h: screen.height,
        },
    });

    if (navigator.sendBeacon !== undefined) {
        let openTime: number | undefined = undefined;
        let duration = 0;

        const isPageActive = (): boolean =>
            document.visibilityState === 'visible' && document.hasFocus();

        const onPageStateChange = () => {
            if (isPageActive()) {
                if (!openTime) {
                    openTime = performance.now();
                }
            } else {
                if (openTime) {
                    duration += performance.now() - openTime;
                    openTime = undefined;
                }
            }
        };

        ['focus', 'blur', 'visibilitychange'].forEach(event =>
            window.addEventListener(event, onPageStateChange),
        );
        onDocumentReady(onPageStateChange);

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                const totalDuration = Math.round(duration / 1000);
                duration = 0;

                if (totalDuration < 3) {
                    return;
                }

                const blob = new Blob([JSON.stringify({
                    action: 'leave',
                    url: location.origin + location.pathname,
                    duration: totalDuration,
                })]);
                navigator.sendBeacon(url, blob);
            }
        });
    }
};

export interface SiteClueOptions {
    endpoint?: string;
}

const attrPrefix = 'data-siteclue-';
const script = document.querySelector(`script[${attrPrefix}id]`);

if (script !== null) {
    const attr = (key: string) => script.getAttribute(attrPrefix + key);

    const id = attr('id') as string;
    const endpoint = attr('endpoint') || undefined;

    init(id, {
        endpoint,
    });
}
