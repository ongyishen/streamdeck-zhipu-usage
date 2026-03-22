/// <reference path="../utils/common.js" />
/// <reference path="../utils/action.js" />

const $local = false, $back = false, $dom = {
    main: $('.sdpi-wrapper')
};

const $propEvent = {
    didReceiveSettings(data) {
        console.log('[PI] didReceiveSettings:', data);
        if (data && data.settings) {
            if (data.settings.apiKey !== undefined) {
                document.getElementById('apiKey').value = data.settings.apiKey;
            }
            if (data.settings.refreshInterval !== undefined) {
                document.getElementById('refreshInterval').value = data.settings.refreshInterval;
            }
        }
    }
};

function updateSettings() {
    if ($settings) {
        $settings.apiKey = document.getElementById('apiKey').value;
        let refreshInterval = parseInt(document.getElementById('refreshInterval').value) || 5;
        if (refreshInterval < 1) refreshInterval = 1;
        if (refreshInterval > 60) refreshInterval = 60;
        $settings.refreshInterval = refreshInterval;
    }
}
