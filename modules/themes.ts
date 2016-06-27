export interface Theme {
    id: number,
    name: string,
    element: {
        placement: "before" | "in",
        selector: string,
        inputClasses?: string,
    }
}

/**
 * Known themes used to tell the client where to insert the datepicker.
 */
export const Themes: Theme[] = [
    {
        id: 79146374,
        name: "launchpad-star",
        element: {
            placement: "before",
            selector: "input.btn--secondary.update-cart[name=update]"
        }
    },
    {
        id: 135351494,
        name: "Atlantic",
        element: {
            placement: "in",
            selector: "div.cart-tools > div.instructions",
            inputClasses: "field",
        }
    }
]