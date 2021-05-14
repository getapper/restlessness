import qrcode from 'qrcode';

export const useQrCode = async (url: string, options?: qrcode.QRCodeOptions) => {
    return qrcode.create(url, options);
};
