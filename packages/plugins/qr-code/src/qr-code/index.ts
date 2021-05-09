import QRCode from "easyqrcodejs-nodejs";

export const useQrCode = async (options) => {
    const qrcode = new QRCode(options);
    return await qrcode.toDataURL();
};
