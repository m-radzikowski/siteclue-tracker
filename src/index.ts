let config: {
    url: string;
    disable: boolean;
};

const send = (data: Record<string, unknown>, asBeacon = false) => {
    if (config.disable) {
        return;
    }

    if (asBeacon) {
        const blob = new Blob([JSON.stringify(data)]);
        navigator.sendBeacon(config.url, blob);
    } else {
        const request = new XMLHttpRequest();
        request.open('POST', config.url, true);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(data));
    }
};

const onDocumentReady = (fn: () => void) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

const currentUrl = () =>
    window.location.origin + window.location.pathname;

export const init = (id: string, {
    endpoint = 'wh1clg0ena.execute-api.eu-west-1.amazonaws.com',
    disable = false,
}: SiteClueOptions = {}): void => {
    config = {
        url: `https://${endpoint}/collect`,
        disable: disable || localStorage.getItem('SiteClue.disable') !== null,
    };

    const {screen} = window;
    send({
        action: 'view',
        url: currentUrl(),
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
                    duration = performance.now() - openTime;
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

                if (totalDuration < 5) {
                    return;
                }

                send({
                    action: 'leave',
                    url: currentUrl(),
                    duration: totalDuration,
                }, true);
            }
        });
    }
};

export interface SiteClueOptions {
    endpoint?: string;
    disable?: boolean;
}

export const event = (category: string, action: string, label?: string): void => {
    send({
        action: 'event',
        url: currentUrl(),
        category,
        eventAction: action,
        label,
    });
};

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
