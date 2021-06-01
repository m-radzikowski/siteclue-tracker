export const onDocumentReady = (fn: () => void): void => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

export const currentUrl = (): string =>
    window.location.origin + window.location.pathname;
