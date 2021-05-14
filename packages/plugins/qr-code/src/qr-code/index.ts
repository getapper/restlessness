import QRCode from 'easyqrcodejs-nodejs';
import qrcode from 'qrcode';

export enum QrCorrectLevels{
    H= QRCode.CorrectLevel.H,
    Q= QRCode.CorrectLevel.Q,
    L= QRCode.CorrectLevel.L,
    M= QRCode.CorrectLevel.M,
}

export interface QrCodeOptions {
    /** BASIC OPTIONS
     * @text text to encode in QR format
     * @width width of the QR Code in px
     * @height height of the QR Code in px
     * @colorDark CSS color string for the dark color in auto-coloring patterns
     * @colorLight CSS color string for the light color in auto-coloring patterns
     * @correctLevel enum for the correctLevel
     * */
    text: string;
    width?: number;
    height?: number;
    colorDark?: string;
    colorLight?: string;
    correctLevel?: QrCorrectLevels;
    /** DOT STYLE
     * @dotScale Dot style scale. Ranges: 0-1.0
     * @dotScalTiming Dot style scale for timing pattern. Ranges: 0-1.0
     * @dotScaleTiming_V Dot style scale for horizontal timing pattern. Ranges: 0-1.0
     * @dotScaleTiming_H Dot style scale for vertical timing pattern. Ranges: 0-1.0
     * @dotScaleA Dot style scale for alignment pattern. Ranges: 0-1.0
     * @dotScaleAO Dot style scale for alignment outer pattern. Ranges: 0-1.0
     * @dotScaleAI Dot style scale for alignment inner pattern. Ranges: 0-1.0
     * */
    dotScale?: number;
    dotScaleTiming?: number;
    dotScaleTiming_V?: number;
    dotScaleTiming_H?: number;
    dotScaleA?: number;
    dotScaleAO?: number;
    dotScaleAI?: number;
    /** QUIET ZONE OPTIONS
     * @quietZone size of the quiet zone
     * @quietZoneColor rgba string of the background for the quiet zone
     * */
    quietZone?: number;
    quietZoneColor?: string;
    /** LOGO OPTIONS
     * @logo Logo Image Path or Base64 encoded image. If use relative address, relative to easy.qrcode.min.js
     * @logoWidth width in px
     * @logoHeight height in px
     * @logoBackgroundTransparent Whether the background transparent image(PNG) shows transparency. When true, logoBackgroundColor is invalid
     * @logoBackgroundColor string with the CSS color of the logo background. Valid when logoBackgroundTransparent is false
     * */
    logo?: string;
    logoWidth?: number;
    logoHeight?: number;
    logoBackgroundTransparent?: boolean;
    logoBackgroundColor?: string;
    /** BACKGROUND IMAGE OPTIONS
     *
     * @backgroundImage Background Image Path or Base64 encoded image. If use relative address, relative to easy.qrcode.min.js
     * @backgroundImageAlpha Background image transparency. Ranges: 0-1.0
     * @autoColor Automatic color adjustment(for data block)
     * @autoColorDark rgba(0, 0, 0, .6)	Automatic color: dark CSS color
     * @autoColorLight rgba(255, 255, 255, .7)	Automatic color: light CSS color
     *
     * */
    backgroundImage?: string;
    backgroundImageAlpha?: number;
    autoColor?: boolean;
    autoColorDark?: string;
    autoColorLight?: string;
    /** POSITION PATTERN COLOR OPTIONS
     * @PO string for Global Posotion Outer CSS color. if not set, the defaut is colorDark
     * @PI string for Global Posotion Inner CSS color. if not set, the defaut is colorDark
     * @PO_TL Posotion Outer CSS color - Top Left
     * @PI_TL Posotion Inner CSS color - Top Left
     * @PO_TR Posotion Outer CSS color - Top Right
     * @PI_TR Posotion Inner CSS color - Top Right
     * @PO_BL Posotion Outer CSS color - Bottom Left
     * @PI_BL Posotion Inner CSS color - Bottom Left
     * */
    PO?: string;
    PI?: string;
    PO_TL?: string;
    PI_TL?: string;
    PO_TR?: string;
    PI_TR?: string;
    PO_BL?: string;
    PI_BL?: string;
    /** ALIGNMENT COLOR OPTIONS
     * @AO Alignment Outer CSS color. if not set, the defaut is colorDark
     * @AI Alignment Inner CSS color. if not set, the defaut is colorDark
     * */
    AO?: string;
    AI?: string;
    /** TIMING PATTERN OPTIONS
     * @timing string with the color of the timing pattern default is colorDark
     * @timing_H string specifying the horizontal timing pattern color
     * @timingV string specifying the vertical timing pattern color
     * */
    timing?: string;
    timing_H?: string;
    timing_V?: string;
    /** TITLE OPTIONS
     * @title string containing the title
     * @titleFont string specifying the CSS style of the font
     * @titleColor string specifying the title color
     * @titleBackgroundColor string specifying the title background color
     * @titleHeight number specifying the title height in px
     * @titleTop number specifying the title y coordinate
     * */
    title?: string;
    titleFont?: string;
    titleColor?: string;
    titleBackgroundColor?: string;
    titleHeight?: number;
    titleTop?: number;
    /** SUBTITLE OPTIONS
     * @subTitle string with the subtitle
     * @subTitleFont string specifying the style of the font in CSS
     * @subTitleColor string specifying the color of the subtitle in CSS
     * @subTitleTop y coordinates of the subtitle (default is 0)
     **/
    subTitle?: string;
    subTitleFont?: string;
    subTitleColor?: string;
    subTitleTop?: string;
    /** EVENT HANDLER
     * @RenderingHandler Callback function when rendering start work. can use to hide loading state or handling
     * */
    onRenderingStart?: (qrCodeOptions) => any;
    /** IMAGE FORMAT OPTIONS
     * @format format of the image generated
     * @compressionLevel ZLIB compression level between 0 and 9. (PNGs only)
     * @quality A number specifying the quality (0 to 1). (JPGs only)
     * */
    format?: 'PNG' | 'JPG';
    compressionLevel?: number;
    quality?: number;
    /** VERSION AND BINARY OPTIONS
     * @version The symbol versions of QR Code range from Version 1 to Version 40. default 0 means automatically choose the closest version based on the text length. Information capacity and versions of QR Codes NOTE: If you set a value less than the minimum version available for text, the minimum version is automatically used.
     * @binary boolean specifying if the pattern has to follow a binary model
     * */
    version?: number;
    binary?: boolean;
}

export const useQrCode = async (url: string): Promise<string> => {
    return qrcode.toDataURL(url);
};

export const useEnhancedQrCode = async (options: QrCodeOptions) => {
    return new QRCode(options);
};
