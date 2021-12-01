import {config} from './config';
import {send} from './send';
import {currentUrl, onDocumentReady} from './util';
import {setupEventsFromDataAttrs} from './event';

export const init = (id: string, options?: SiteClueOptions): void => {
    config.id = id;
    if (options?.endpoint !== undefined) {
        config.endpoint = options.endpoint;
    }

    config.disable = options?.disable || localStorage.getItem('SiteClue.disable') === 'true';

    if (config.disable) {
        return;
    }

    sendView(document.referrer);

    /* eslint-disable @typescript-eslint/unbound-method */
    history.pushState = after(history.pushState, afterHistoryChange);
    history.replaceState = after(history.replaceState, afterHistoryChange);
    history.back = after(history.back, afterHistoryChange);
    history.forward = after(history.forward, afterHistoryChange);
    history.go = after(history.go, afterHistoryChange);
    window.onpopstate = after(window.onpopstate, afterHistoryChange);
    /* eslint-enable */

    monitorDuration();

    onDocumentReady(setupEventsFromDataAttrs);
};

const after = (fn: ((...args: never[]) => void) | null, callback: (...args: unknown[]) => void) => {
    return function (...args: unknown[]) {
        if (fn) {
            // @ts-ignore
            fn.apply(this, args);
        }
        callback(...args);
    };
};

let previousRef = currentUrl();
const afterHistoryChange = () => {
    const newRef = currentUrl();
    if (previousRef !== newRef) {
        sendView(previousRef);
        previousRef = newRef;

        // TODO
        // removeEvents();
        // setTimeout(setupEventsFromDataAttrs, 300);
    }
};

const sendView = (referrer: string) => {
    const {screen} = window;
    send('view', {
        referrer: referrer,
        screen: {
            w: screen.width,
            h: screen.height,
        },
    });
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

            send('leave', {
                duration: totalDuration,
            });
        }
    }, true);
};

export const initFromScriptTag = (): void => {
    const script = document.currentScript;
    const id = script?.getAttribute('data-id');

    if (script && id) {
        const endpoint = script.getAttribute('data-endpoint') || undefined;

        init(id, {
            endpoint,
        });
    }
};

export interface SiteClueOptions {
    endpoint?: string;
    disable?: boolean;
}
