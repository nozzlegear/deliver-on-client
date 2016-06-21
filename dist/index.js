"use strict";
var DeliverOn = (function () {
    function DeliverOn(config) {
        this.jquery = $.noConflict();
        console.log("Starting Deliver On with settings", config);
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
// Make the class available to the browser window
self["DeliverOn"] = DeliverOn;
