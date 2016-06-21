export interface Config 
{
    label?: string;
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
}

export class DeliverOn
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
        
    }
}