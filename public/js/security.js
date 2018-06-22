'use strict';

class Security {
    constructor() { }

    static async storeCredentials(form) {
        if (!navigator.credentials) return false; // Not supported!

        const credential = new PasswordCredential(form);

        return await navigator.credentials.store(credential);
    }

    static async requestCredential() {
        if (!navigator.credentials) return false;

        const credential = await navigator.credentials.get({ password: true, mediation: 'optional' });

        if (credential) {
            return Security.doLogin({
                loggedOn: true
            });
        }

        return false;
    }

    static doLogin(e) {
        if (e && e.loggedOn) return true;

        e.preventDefault();

        const form = document.querySelector('#loginForm');

        if (form.id.value == form.password.value) {
            const aside = form.parentElement;
            const icon = document.querySelector('#userIcon');
            const parent = icon.closest('.login');

            parent.classList.add('loggedIn');
            aside.classList.remove('overlay');
            aside.classList.add('hide');
            icon.removeEventListener('click', Security.doLogon);
            icon.addEventListener('click', Security.doLogoff, false);
            Security.storeCredentials(form).then(cred => console.log(cred));
        }

        return false;
    }

    static doLogoff(e) {
        if (confirm('Do you want to logoff?')) {
            const icon = document.querySelector('#userIcon');
            const parent = icon.closest('.login');

            parent.classList.remove('loggedIn');
            icon.removeEventListener('click', Security.doLogoff);
            icon.addEventListener('click', Security.doLogon, false);
            Security.preventSilentAcces();
        }
    }

    static async preventSilentAcces() {
        if (!navigator.credentials) return await false; // Not supported!

        return await navigator.credentials.preventSilentAccess();
    }

    static doReset(e) {
        const form = document.querySelector('#loginForm');
        const aside = form.parentElement;

        aside.classList.remove('overlay');
        aside.classList.add('hide');
    }

    static showForm() {
        const form = document.querySelector('#loginForm');
        const aside = form.parentElement;

        aside.classList.add('overlay');
        aside.classList.remove('hide');
        form.addEventListener('submit', Security.doLogin, false);
        form.addEventListener('reset', Security.doReset, false);
    }
}