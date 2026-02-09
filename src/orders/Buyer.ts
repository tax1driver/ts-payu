/**
 * Buyer
 *
 * @export
 * @interface Buyer
 */
export interface Buyer {
    /**
     * Customer ID in merchant system
     *
     * @type {string}
     * @memberof Buyer
     */
    extCustomerId?: string;

    /**
     * Buyer's email address
     *
     * @type {string}
     * @memberof Buyer
     */
    email: string;

    /**
     * Buyer's first name
     *
     * @type {string}
     * @memberof Buyer
     */
    firstName?: string;

    /**
     * Buyer's last name
     *
     * @type {string}
     * @memberof Buyer
     */
    lastName?: string;

    /**
     * Buyer's telephone number
     *
     * @type {string}
     * @memberof Buyer
     */
    phone?: string;

    /**
     * National Identification Number
     *
     * @type {string}
     * @memberof Buyer
     */
    nin?: string;

    /**
     * Language code (e.g., 'pl', 'en')
     *
     * @type {string}
     * @memberof Buyer
     */
    language?: string;

    /**
     * Date of birth
     *
     * @type {string}
     * @memberof Buyer
     */
    birthDate?: string;

    /**
     * Delivery information
     *
     * @type {object}
     * @memberof Buyer
     */
    delivery?: {
        street?: string;
        postalBox?: string;
        postalCode?: string;
        city?: string;
        state?: string;
        countryCode?: string;
        name?: string;
        recipientName?: string;
        recipientEmail?: string;
        recipientPhone?: string;
    };
}