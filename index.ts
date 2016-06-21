import * as $ from "jquery";
import * as Promise from "bluebird";

export interface Config 
{
    label?: string;
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
}

export class Client
{
    constructor(config: Config)
    {
        console.log("Starting Deliveron Client with settings", config);

        // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
        // determine which theme the shop is using and load the widget into the appropriate element.
        this.hostContainer = document.querySelector("[data-deliveronhost]");

        if (! this.hostContainer)
        {
            // TODO: Determine which theme the shop is using and load the widget into the appropriate element.
        }

        this.loadWidget(this.hostContainer);
    }

    private hostContainer: Element;

    private jquery = $.noConflict();

    private loadWidget(container: Element)
    {
        // TODO: Load the widget + jquery datepicker.
        this.ensureJqueryDatepicker().then((result) =>
        {
            
        })
    }

    private ensureJqueryDatepicker()
    {
        return new Promise<void>((resolve, reject) =>
        {
            // TODO: If jquery datepicker exists, resolve immediately. Else load it from npmcdn.

            const script = document.createElement("script");
            script.src = "";
            script.type = "text/javascript";
        });
    }
}