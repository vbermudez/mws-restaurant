'use strict';

class Security {
    constructor() { }

    static async storeCredentials(form) {
        if (!navigator.credentials) return await false; // Not supported!

        const credential = new PasswordCredential(form);

        return await navigator.credentials.store(credential);
    }

    static async requestCredential() {
        if (!navigator.credentials) return false;

        const credential = await navigator.credentials.get({ password: true, mediation: 'optional' });

        if (credential) {
            form.username.value = credential.id;
            form.password.value = credential.password;

            return doLogin({
                loggedOn: true
            });
        }

        return false;
    }

    static doLogin(e) {
        if (e && e.loggedOn) return;

        e.preventDefault();

        const form = document.querySelector('#loginForm');

        if (form.username == form.password) {
            const aside = form.parentElement;

            if (!aside.classList.contains('hide')) aside.classList.add('hide');

            Security.storeCredentials(form);
        }

        return false;
    }

    static async doLogoff() {
        if (!navigator.credentials) return await false; // Not supported!

        return await navigator.credentials.preventSilentAccess();
    }

    static showForm() {
        const form = document.querySelector('#loginForm');
        const aside = form.parentElement;

        aside.classList.add('overlay');
        aside.classList.remove('hide');
        form.addEventListener('submit', Security.doLogin, false);
    }
}