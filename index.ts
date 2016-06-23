import * as $ from "jquery";
import {Themes, Theme} from "./modules/themes";

declare const Shopify: {theme: {id: number, name: string, role: string}};

//Variables set by webpack during build.
declare const VERSION: string;
declare const TEST_MODE: boolean;
declare const require: any;

//Import libs and styles
require("air-datepicker");
require("air-datepicker/dist/js/i18n/datepicker.da.js");
require("air-datepicker/dist/js/i18n/datepicker.de.js");
require("air-datepicker/dist/js/i18n/datepicker.en.js");
require("air-datepicker/dist/js/i18n/datepicker.nl.js");
require("air-datepicker/dist/js/i18n/datepicker.pt.js");
require("air-datepicker/dist/js/i18n/datepicker.pt-BR.js");
require("air-datepicker/dist/js/i18n/datepicker.ro.js");
require("air-datepicker/dist/js/i18n/datepicker.zh.js");
require("node_modules/air-datepicker/dist/css/datepicker.min.css");
require("sass/themes.scss");

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
                throw new Error("No suitable Deliveron picker host found.");
            }
        }

        //Add the theme name as a class on the body element
        document.body.classList.add(Shopify.theme.name);

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

    private loadWidget()
    {
        const container = document.createElement("div");
        container.id = "deliveron-container";

        const input = document.createElement("input");
        input.placeholder = this.config.label;
        input.type = "text";
        input.id = "deliveron-picker";

        container.appendChild(input);

        const placement = this.theme.element.placement;
        const element = document.querySelector(this.theme.element.selector);

        if (placement === "in")
        {
            element.appendChild(container);
        }
        else
        {
            element.parentNode.insertBefore(container, element);
        }

        $(input)["datepicker"]({
            minDate: new Date(),
            language: "en",
        }) 
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