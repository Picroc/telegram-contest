window.store = {};
const updateStore = (type, ...options) => new CustomEvent('updatestore', { detail: { type, ...options } });

export const setUserInfo = data => {
	window.store.userInfo = data;
	document.getElementById('settings').dispatchEvent(updateStore('setUserInfo'));
};

export const getUserInfo = () => {
	return window.store.userInfo;
};
