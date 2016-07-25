/// <reference path="node_modules/@types/shopify/shopify.d.ts" />
/// <reference path="node_modules/@types/air-datepicker/air-datepicker.d.ts" />

import * as $ from "jquery";
import * as React from 'react'; 
import * as Dom from "react-dom";
import {clone} from 'lodash';

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

export interface IProps extends React.Props<any>
{
    label: {
        text: string;
        placement: "top" | "right" | "bottom" | "left";
        textAlignment: "left" | "right";
        classes?: string;
    };
    input: {
        classes?: string;
        placeholder: string;
    }
    placement: "left" | "right" | "center";
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
    maxDays?: number;
}

export interface IState
{
    
}



export class DeliverOnWidget extends React.Component<IProps, IState>
{
    constructor(props: IProps)
    {
        super(props);
        
        this.configureState(props, false);
    }
    
    public state: IState = {};

    private lastDate: Date;

    private input: HTMLInputElement;

    private picker: DatepickerInstance;
    
    //#region Utility functions
    
    private configureState(props: IProps, useSetState: boolean)
    {
        let state: IState = {
            
        }
        
        if (!useSetState)
        {
            this.state = state;
            
            return;
        }
        
        this.setState(state);
    }
    
    //#endregion

    //#region Event handlers

    private updateDate(formattedDate: string, date: Date, instance?: DatepickerInstance)
    {
        this.lastDate = date;

        const att: CartAttributes = {
            deliverOn: formattedDate,
            deliverOnIso: date,
        };

        Shopify.updateCartAttributes(att, () => console.log("Delivery date updated to %s", formattedDate));
    }

    /**
     * Prevents the user from entering dates by typing them into the text field. Will reselect their last selected date 
     * if available, else it will clear the input.
     */
    private preventTextEntry(e: React.FormEvent<HTMLInputElement>)
    {
        e.preventDefault();

        const val = e.target.value;

        // Let the user clear the input if the delete the date.
        if (!val || !this.lastDate)
        {
            this.picker.clear();
            
            if (!val)
            {
                this.updateDate(undefined, undefined);
            }
        }
        else
        {
            this.picker.selectDate(this.lastDate || new Date());
        }
    }

    //#endregion
    
    public componentDidMount()
    {
        let maxDate: Date;

        if (this.props.maxDays)
        {
            maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + this.props.maxDays);
        }

        // The Shopify admin bar can interfere with the datepicker's offset when open. 
        // If it exists and has a width of 40px, offset the datepicker by -40(height)
        const adminBar = document.querySelector("#admin_bar_iframe"); 

        this.picker = $(this.input)["datepicker"]({
            minDate: new Date(),
            language: "en",
            maxDate: maxDate || undefined,
            offset: adminBar && adminBar.clientWidth > 40 ? (adminBar.clientHeight * -1) : 0,
        }).data("datepicker");

        // Get the user's cart to check if they've already set a date
        Shopify.getCart((cart) =>
        {
            const att = cart.attributes as CartAttributes;

            console.log("Got cart attributes", att);

            if (att.deliverOn && att.deliverOnIso)
            {
                this.lastDate = new Date(att.deliverOnIso as string);

                this.picker.selectDate(this.lastDate);
            }

            // Update the picker with the onSelect handler. Set *after* the default date has been selected so there isn't 
            // an extraneous update call just for loading the picker.
            this.picker.update({
                onSelect: (formattedDate, date, picker) => this.updateDate(formattedDate, date, picker),
            })
        })
    }
    
    public componentDidUpdate()
    {
        
    }

    public shouldComponentUpdate()
    {
        // State never changes, component should never need to re-render.
        return false;
    }
    
    public componentWillReceiveProps(props: IProps)
    {
        this.configureState(props, true);
    }
    
    public render()
    {
        const props = this.props;

        return (
            <div id="deliveron-flex-aligner" className={`placement-${props.placement}`}>
                <div id="deliveron-container" className={`placement-${props.label.placement}`}>
                    <label 
                        htmlFor="deliveron-picker" 
                        id="deliveron-label" 
                        className={`placement-${props.label.placement} text-align-${props.label.textAlignment} ${props.label.classes || ""}`}>
                        {props.label.text}
                    </label>
                    <input 
                        placeholder={props.input.placeholder} 
                        name="deliveron-picker" 
                        id="deliveron-picker"
                        className={props.input.classes || ""}
                        ref={(r) => this.input = r} 
                        onChange={(e) => this.preventTextEntry(e)}
                        type="text" />
                </div>
            </div>
        );
    }
}

export class Client
{
    constructor(private props: IProps)
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
            // Find the input[name=update] tag and append the widget before it.
            const input = document.querySelector("[name=update]");
            const parent = input.parentElement;

            // Create a div as the container and insert it before the update button.
            this.targetElement = document.createElement("div");
            
            parent.insertBefore(this.targetElement, input);
        }

        //Ensure the Shopify API wrapper is loaded and then load the widget.
        this.ensureShopifyWrapper(() => {
            Dom.render(<DeliverOnWidget {...props} />, this.targetElement);
        });
    }

    public static get VERSION()
    {
        return VERSION;   
    }

    private targetElement: Element;

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
}

if (TEST_MODE)
{
    window["deli"] = new Client({
        label: { 
            text: "Pick your delivery date:",
            textAlignment: "left",
            placement: "top",
        },
        input: {
            placeholder: "Click/tap to select",
        },
        placement: "right",
        format: "mm/dd/yyyy",
        addPickerToCheckout: false,
        allowChangeFromCheckout: false,
        maxDays: 7,
    })
}