(function (factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        var v = factory(require, exports); if (v !== undefined) module.exports = v;
    }
    else if (typeof define === 'function' && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    var DeliverOn = (function () {
        function DeliverOn(config) {
            this.jquery = $.noConflict();
            console.log("Starting Deliveron Client with settings", config);
            // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
            // determine which theme the shop is using and load the widget into the appropriate element.
            this.hostContainer = document.querySelector("[data-deliveronhost]");
            if (!this.hostContainer) {
            }
            this.loadWidget(this.hostContainer);
        }
        DeliverOn.prototype.loadWidget = function (container) {
        };
        return DeliverOn;
    }());
    exports.DeliverOn = DeliverOn;
});
