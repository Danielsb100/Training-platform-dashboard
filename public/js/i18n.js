/**
 * i18n.js — Lightweight client-side internationalization engine
 * 
 * Usage in HTML:  <span data-i18n="common.save">Save</span>
 *                 <input data-i18n-placeholder="common.search" placeholder="Search...">
 *                 <div data-i18n-title="nav.home" title="Home">...</div>
 * 
 * Usage in JS:    t('common.save')  →  "Salvar" (if pt-BR)
 *                 t('common.save', 'Fallback')  →  "Fallback" (if key missing)
 */

(function () {
    'use strict';

    const SUPPORTED_LOCALES = [
        'en-US', 'pt-BR', 'es-ES', 'it-IT', 'ro-RO',
        'sq-AL', 'fr-FR', 'el-GR', 'ru-RU', 'de-DE'
    ];
    const DEFAULT_LOCALE = 'en-US';
    const STORAGE_KEY = 'i18n_lang';

    let _currentLocale = DEFAULT_LOCALE;
    let _translations = {};      // current locale translations
    let _fallback = {};           // en-US fallback
    let _ready = false;
    let _readyCallbacks = [];

    // ── Helpers ──────────────────────────────────────────────

    function resolveLocale(raw) {
        if (!raw) return DEFAULT_LOCALE;
        // Exact match
        if (SUPPORTED_LOCALES.includes(raw)) return raw;
        // Match by language prefix  (e.g. "it" → "it-IT")
        const prefix = raw.split('-')[0].toLowerCase();
        const match = SUPPORTED_LOCALES.find(l => l.toLowerCase().startsWith(prefix));
        return match || DEFAULT_LOCALE;
    }

    function detectLocale() {
        // 1. Saved preference
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;
        // 2. Browser language
        const browserLang = navigator.language || navigator.userLanguage || '';
        return resolveLocale(browserLang);
    }

    function getNestedValue(obj, path) {
        return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
    }

    async function fetchJSON(url) {
        try {
            const res = await fetch(url);
            if (!res.ok) return {};
            return await res.json();
        } catch (e) {
            console.warn('[i18n] Failed to load:', url, e);
            return {};
        }
    }

    // ── Public API ──────────────────────────────────────────

    /** Get translated string */
    window.t = function (key, fallback) {
        const val = getNestedValue(_translations, key);
        if (val !== undefined) return val;
        const fb = getNestedValue(_fallback, key);
        if (fb !== undefined) return fb;
        return fallback !== undefined ? fallback : key;
    };

    /** Apply translations to DOM elements with data-i18n attributes */
    window.applyTranslations = function (root) {
        const container = root || document;

        // textContent
        container.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const val = t(key);
            if (val && val !== key) {
                // Preserve child elements (icons etc) by only setting text of text nodes
                // If element has only text, set textContent; if it has children, set last text node
                if (el.children.length === 0) {
                    el.textContent = val;
                } else {
                    // Find the last text node or append one
                    const nodes = Array.from(el.childNodes);
                    const textNode = nodes.reverse().find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
                    if (textNode) {
                        // preserve leading space
                        const leadingSpace = textNode.textContent.match(/^\s*/)[0];
                        textNode.textContent = leadingSpace + val;
                    }
                }
            }
        });

        // placeholder
        container.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const val = t(key);
            if (val && val !== key) el.placeholder = val;
        });

        // title (tooltip)
        container.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            const val = t(key);
            if (val && val !== key) el.title = val;
        });

        // value (buttons with value attr)
        container.querySelectorAll('[data-i18n-value]').forEach(el => {
            const key = el.getAttribute('data-i18n-value');
            const val = t(key);
            if (val && val !== key) el.value = val;
        });
    };

    /** Change the active language */
    window.setLanguage = async function (locale) {
        const resolved = resolveLocale(locale);
        _currentLocale = resolved;
        localStorage.setItem(STORAGE_KEY, resolved);

        if (resolved === 'en-US') {
            _translations = _fallback;
        } else {
            _translations = await fetchJSON('/lang/' + resolved + '.json');
        }
        applyTranslations();
    };

    /** Get current locale */
    window.getCurrentLocale = function () {
        return _currentLocale;
    };

    /** Register a callback for when translations are ready */
    window.onI18nReady = function (cb) {
        if (_ready) { cb(); return; }
        _readyCallbacks.push(cb);
    };

    // ── Initialization ──────────────────────────────────────

    async function init() {
        _currentLocale = detectLocale();

        // Always load English as fallback
        _fallback = await fetchJSON('/lang/en-US.json');

        if (_currentLocale === 'en-US') {
            _translations = _fallback;
        } else {
            _translations = await fetchJSON('/lang/' + _currentLocale + '.json');
        }

        applyTranslations();
        _ready = true;
        _readyCallbacks.forEach(cb => { try { cb(); } catch (e) { console.error(e); } });
        _readyCallbacks = [];
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
