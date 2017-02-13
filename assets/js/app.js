import 'babel-polyfill';

import async from 'async';
import global from './theme/global';

const scriptURL = document.currentScript.src;
// eslint-disable-next-line camelcase, no-undef
__webpack_public_path__ = scriptURL.slice(0, scriptURL.lastIndexOf('/') + 1);

const PageClasses = {
    mapping: {
        'pages/account/orders/all': () => System.import('./theme/account'),
        'pages/account/orders/details': () => System.import('./theme/account'),
        'pages/account/addresses': () => System.import('./theme/account'),
        'pages/account/add-address': () => System.import('./theme/account'),
        'pages/account/add-return': () => System.import('./theme/account'),
        'pages/account/add-wishlist': () => System.import('./theme/wishlist'),
        'pages/account/recent-items': () => System.import('./theme/account'),
        'pages/account/download-item': () => System.import('./theme/account'),
        'pages/account/edit': () => System.import('./theme/account'),
        'pages/account/inbox': () => System.import('./theme/account'),
        'pages/account/return-saved': () => System.import('./theme/account'),
        'pages/account/returns': () => System.import('./theme/account'),
        'pages/auth/login': () => System.import('./theme/auth'),
        'pages/auth/account-created': () => System.import('./theme/auth'),
        'pages/auth/create-account': () => System.import('./theme/auth'),
        'pages/auth/new-password': () => System.import('./theme/auth'),
        'pages/auth/forgot-password': () => System.import('./theme/auth'),
        'pages/blog': () => System.import('./theme/blog'),
        'pages/blog-post': () => System.import('./theme/blog'),
        'pages/brand': () => System.import('./theme/brand'),
        'pages/brands': () => System.import('./theme/brand'),
        'pages/cart': () => System.import('./theme/cart'),
        'pages/category': () => System.import('./theme/category'),
        'pages/compare': () => System.import('./theme/compare'),
        'pages/contact-us': () => System.import('./theme/contact-us'),
        'pages/errors': () => System.import('./theme/errors'),
        'pages/errors/404': () => System.import('./theme/404-error'),
        'pages/gift-certificate/purchase': () => System.import('./theme/gift-certificate'),
        'pages/gift-certificate/balance': () => System.import('./theme/gift-certificate'),
        'pages/gift-certificate/redeem': () => System.import('./theme/gift-certificate'),
        // eslint-disable-next-line
        'global': global,
        'pages/home': () => System.import('./theme/home'),
        'pages/order-complete': () => System.import('./theme/order-complete'),
        'pages/page': () => System.import('./theme/page'),
        'pages/product': () => System.import('./theme/product'),
        'pages/search': () => System.import('./theme/search'),
        'pages/rss': () => System.import('./theme/rss'),
        'pages/sitemap': () => System.import('./theme/sitemap'),
        'pages/subscribed': () => System.import('./theme/subscribe'),
        'pages/account/wishlist-details': () => System.import('./theme/wishlist'),
        'pages/account/wishlists': () => System.import('./theme/wishlist'),
    },
    /**
     * Getter method to ensure a good page type is accessed.
     * @param page
     * @returns {*}
     */
    get(pageKey) {
        if (this.mapping[pageKey]) {
            return this.mapping[pageKey];
        }

        return false;
    },
};

/**
 *
 * @param {Object} pageObj
 */
function series(pageObj) {
    async.series([
        pageObj.before.bind(pageObj), // Executed first after constructor()
        pageObj.loaded.bind(pageObj), // Main module logic
        pageObj.after.bind(pageObj), // Clean up method that can be overridden for cleanup.
    ], (err) => {
        if (err) {
            throw new Error(err);
        }
    });
}

/**
 * Loads the global module that gets executed on every page load.
 * Code that you want to run on every page goes in the global module.
 * @param {object} pages
 * @returns {*}
 */
function loadGlobal(pages) {
    const Global = pages.get('global');

    return new Global;
}

/**
 *
 * @param {function} pageFunc
 * @param {} pages
 */
function loader(pageFunc, pages) {
    if (pages.get('global')) {
        const globalPageManager = loadGlobal(pages);

        globalPageManager.context = pageFunc.context;

        series(globalPageManager);
    }
    series(pageFunc);
}

/**
 * This function gets added to the global window and then called
 * on page load with the current template loaded and JS Context passed in
 * @param templateFile String
 * @param contextJSON
 * @returns {*}
 */
window.stencilBootstrap = function stencilBootstrap(templateFile, contextJSON = '{}') {
    const pages = PageClasses;
    const context = JSON.parse(contextJSON);

    return {
        load() {
            document.addEventListener('DOMContentLoaded', () => {
                const pageTypePromise = pages.get(templateFile);
                if (pageTypePromise !== false) {
                    pageTypePromise().then(PageTypeFn => {
                        // eslint-disable-next-line new-cap
                        const pageType = new PageTypeFn.default(context);

                        pageType.context = context;

                        return loader(pageType, pages);
                    });
                } else {
                    throw new Error(`${templateFile} Module not found`);
                }
            });
        },
    };
};
