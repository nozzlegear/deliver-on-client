import * as $ from "jquery";
import {Themes, Theme} from "./modules/themes";

declare type CartAttributes = { deliverOn: string, deliverOnIso: string | Date };

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
    maxDays?: number;
}

export class Client
{
    constructor(private config: Config)
    {
        // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
        // determine which theme the shop is using and load the widget into the appropriate element.
        if (! document.querySelector(this.theme.element.selector))
        {
            const themeId = Shopify.theme.id;
            const matchingThemes = Themes.filter((theme, index) => theme.id === themeId);
            let found = false;

            // Try to find a matching theme and container
            matchingThemes.forEach((theme, index) => 
            {
                if (document.querySelector(theme.element.selector))
                {
                    this.theme = theme;
                    found = true;

                    return false;
                }
            });

            if (!found)
            {
                // TODO: Make an educated guess as to where the widget should be inserted into the DOM.
                throw new Error("No suitable Deliveron picker host found.");
            }
        }

        //Add the theme name as a class on the body element
        document.body.classList.add("shopify-theme-" + Shopify.theme.id);

        //Ensure the Shopify API wrapper is loaded and then load the widget.
        this.ensureShopifyWrapper(() => this.loadWidget());
    }

    public static get VERSION()
    {
        return VERSION;   
    }

    private theme: Theme = {
        id: Shopify.theme.id,
        name: Shopify.theme.name,
        element: {
            selector: "[data-deliveronhost]",
            placement: "in",
        }
    }

    private lastDate: Date;

    private ensureShopifyWrapper(cb: () => void)
    {
        if (typeof Shopify.updateCartAttributes === "function")
        {
            cb();

            return;
        }

        const script = document.createElement("script");
        script.src = "https://cdn.shopify.com/s/assets/themes_support/api.jquery-c1754bd1a7bb06d28ce2b85087252f0d8af6d848c75139f5e2a263741ba089b0.js";
        script.type = "text/javascript";
        script.onload = (e) =>
        {
            const interval = setInterval(() =>
            {
                if (typeof Shopify.updateCartAttributes === "function")
                {
                    clearInterval(interval);

                    cb();
                }
            }, 250);
        } 

        document.body.appendChild(script);
    }

    private loadWidget()
    {
        const container = document.createElement("div");
        container.id = "deliveron-container";

        const label = document.createElement("label");
        label.htmlFor = "deliveron-picker";
        label.id = "deliveron-label";
        label.textContent = this.config.label;

        const input = document.createElement("input");
        input.placeholder = "Click/tap to select";
        input.type = "text";
        input.name = "deliveron-picker";
        input.id = "deliveron-picker";
        input.onchange = (e) => 
        {
            e.preventDefault();
            
            if (this.lastDate)
            {
                picker.selectDate(this.lastDate);
            }
        }

        container.appendChild(label);
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

        let maxDate: Date;

        if (this.config.maxDays)
        {
            maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + this.config.maxDays);
        }

        const picker = $(input)["datepicker"]({
            minDate: new Date(),
            language: "en",
            maxDate: maxDate || undefined,
        }).data("datepicker");

        // Get the user's cart to check if they've already set a date
        Shopify.getCart((cart) =>
        {
            const att = cart.attributes as CartAttributes;

            if (att.deliverOn && att.deliverOnIso)
            {
                this.lastDate = new Date(att.deliverOnIso as string);

                picker.selectDate(this.lastDate);
            }

            // Update the picker with the onSelect handler. Set *after* the default date has been selected so there isn't 
            // an extraneous update call just for loading the picker.
            picker.update({
                onSelect: (formattedDate, date, picker) => this.updateDate(formattedDate, date, picker),
            })
        })
    }

    private updateDate(formattedDate: string, date: Date, instance: DatepickerInstance)
    {
        this.lastDate = date;

        const att: CartAttributes = {
            deliverOn: formattedDate,
            deliverOnIso: date,
        };

        Shopify.updateCartAttributes(att, () => console.log("Delivery date updated to %s", formattedDate));
    }
}

if (TEST_MODE)
{
    window["deli"] = new Client({
        label: "Pick your delivery date:",
        format: "mm/dd/yyyy",
        addPickerToCheckout: false,
        allowChangeFromCheckout: false,
        maxDays: 7,
    })
}