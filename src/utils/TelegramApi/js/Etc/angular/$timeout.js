export default function $timeout() {
    timeout = (cb, t) => new Promise((resolve, reject) => {
        this.__timeoutID = setTimeout(() => {
            resolve(cb());
        }, t || 0);
    });

    timeout.cancel = (promise) => {
        if (!promise) {
            return;
        }

        clearTimeout(promise.__timeoutID);
    };

    return timeout;
}
