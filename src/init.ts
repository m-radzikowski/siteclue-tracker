import {attrPrefix, config} from './config';
import {send} from './send';
import {currentUrl, onDocumentReady} from './util';

export const init = (id: string, options?: SiteClueOptions): void => {
    if (options?.endpoint !== undefined) {
        config.endpoint = options.endpoint;
    }
    config.disable = options?.disable || localStorage.getItem('SiteClue.disable') === 'true';

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
        monitorDuration();
    }
};

const monitorDuration = () => {
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
        window.addEventListener(event, onPageStateChange, true),
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
    }, true);
};

export const initFromScriptTag = (): void => {
    const script = document.querySelector(`script[${attrPrefix}id]`);

    if (script !== null) {
        const attr = (key: string) => script.getAttribute(attrPrefix + key);

        const id = attr('id') as string;
        const endpoint = attr('endpoint') || undefined;

        init(id, {
            endpoint,
        });
    }
};

export interface SiteClueOptions {
    endpoint?: string;
    disable?: boolean;
}
