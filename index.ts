import * as $ from "jquery";
import * as Promise from "bluebird";
import {Themes, Theme} from "./modules/themes";

declare const Shopify: {theme: {id: number, name: string, role: string}};

//Variables set by webpack during build.
declare const VERSION: string;
declare const TEST_MODE: boolean;

export interface Config 
{
    label?: string;
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
}

export class Client
{
    constructor(private config: Config)
    {
        console.log("Starting Deliveron Client with settings", config);

        // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
        // determine which theme the shop is using and load the widget into the appropriate element.
        if (! document.querySelector(this.theme.element.selector))
        {
            const themeId = Shopify.theme.id;
            const matchingThemes = Themes.filter((theme, index) => theme.id === themeId);

            // Try to find a matching theme and container
            matchingThemes.forEach((theme, index) => 
            {
                if (document.querySelector(theme.element.selector))
                {
                    this.theme = theme;

                    return false;
                }
            });

            if (!this.theme)
            {
                // TODO: Make an educated guess as to where the widget should be inserted into the DOM.
            }
        }

        this.loadWidget();
    }

    private theme: Theme = {
        id: Shopify.theme.id,
        name: Shopify.theme.name,
        element: {
            selector: "[data-deliveronhost]",
            placement: "in",
        }
    }

    private jquery = $.noConflict();

    private loadWidget()
    {
        console.log("Ensuring jQuery datepicker");

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

if (TEST_MODE)
{
    window["deli"] = new Client({
        label: "Pick your delivery date:",
        format: "mm/dd/yyyy",
        addPickerToCheckout: false,
        allowChangeFromCheckout: false,
    })
}