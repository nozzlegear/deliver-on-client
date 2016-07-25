/// <reference path="node_modules/@types/shopify/shopify.d.ts" />
/// <reference path="node_modules/@types/air-datepicker/air-datepicker.d.ts" />
import * as React from 'react';
export interface IProps extends React.Props<any> {
    label: {
        text: string;
        placement: "top" | "right" | "bottom" | "left";
        textAlignment: "left" | "right";
        classes?: string;
    };
    input: {
        classes?: string;
        placeholder: string;
    };
    placement: "left" | "right" | "center";
    format?: "mm/dd/yyyy" | "dd/mm/yyyy";
    addPickerToCheckout?: boolean;
    allowChangeFromCheckout?: boolean;
    maxDays?: number;
}
export interface IState {
}
export declare class DeliverOnWidget extends React.Component<IProps, IState> {
    constructor(props: IProps);
    state: IState;
    private lastDate;
    private input;
    private picker;
    private configureState(props, useSetState);
    private updateDate(formattedDate, date, instance?);
    /**
     * Prevents the user from entering dates by typing them into the text field. Will reselect their last selected date
     * if available, else it will clear the input.
     */
    private preventTextEntry(e);
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(): boolean;
    componentWillReceiveProps(props: IProps): void;
    render(): JSX.Element;
}
export declare class Client {
    private props;
    constructor(props: IProps);
    static readonly VERSION: string;
    private targetElement;
    private ensureShopifyWrapper(cb);
}
