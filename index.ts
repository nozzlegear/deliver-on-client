/// <reference path="node_modules/@types/shopify/shopify.d.ts" />
/// <reference path="node_modules/@types/air-datepicker/air-datepicker.d.ts" />

import * as $ from "jquery";

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
    label: {
        text: string;
        placement: "top" | "right" | "bottom" | "left";
        alignment: "left" | "right";
        classes: string;
    };
    input: {
        classes: string;
        alignment: "left" | "right";
    }
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
    maxDays?: number;
}

export class Client
{
    constructor(private config: Config)
    {
        //Add the theme name as a class on the body element
        document.body.classList.add("shopify-theme-" + Shopify.theme.id);

        this.targetElement = document.querySelector("[data-deliveronhost]");

        // Search for a data-deliveronhost to load the widget into. If it doesn't exist,
        // try to make an intelligent decision on where to insert the widget.
        // Only guess when on the /cart page. If the user wants it on other pages, they'll
        // need to add the [data-deliveronhost].
        if (! this.targetElement && /cart/ig.test(window.location.pathname))
        {
            // TODO: Find the input[name=update] tag and append the widget before it.
        }

        //Ensure the Shopify API wrapper is loaded and then load the widget.
        this.ensureShopifyWrapper(() => this.loadWidget());
    }

    public static get VERSION()
    {
        return VERSION;   
    }

    private targetElement: Element;

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
        const config = this.config;
        const placementClass = `placement-${config.label.placement}`;
        const flexContainer = document.createElement("div");
        flexContainer.id = "deliveron-flex-aligner";

        const container = document.createElement("div");
        container.id = "deliveron-container";
        container.classList.add(placementClass);

        const label = document.createElement("label");
        label.htmlFor = "deliveron-picker";
        label.id = "deliveron-label";
        label.classList.add(placementClass, config.label.classes);
        label.textContent = config.label.text;

        const input = document.createElement("input");
        input.placeholder = "Click/tap to select";
        input.type = "text";
        input.name = "deliveron-picker";
        input.id = "deliveron-picker";
        input.classList.add(config.input.classes);
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
        flexContainer.appendChild(container);

        const placement = this.theme.element.placement;
        const element = document.querySelector(this.theme.element.selector);

        if (placement === "in")
        {
            element.appendChild(flexContainer);
        }
        else
        {
            element.parentNode.insertBefore(flexContainer, element);
        }

        let maxDate: Date;

        if (config.maxDays)
        {
            maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + config.maxDays);
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
        labelPlacement: "top",
        format: "mm/dd/yyyy",
        addPickerToCheckout: false,
        allowChangeFromCheckout: false,
        maxDays: 7,
    })
}