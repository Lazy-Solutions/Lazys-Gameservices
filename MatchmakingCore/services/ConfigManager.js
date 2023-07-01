let currentConfig = {};

const ConfigManager = {
    get: function () {
        return { ...currentConfig };
    },
    set: function (configData) {
        currentConfig = { ...configData };
    },
};

export default ConfigManager;