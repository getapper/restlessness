import qrcode from 'qrcode';

export const useQrCode = async (url: string, options?: qrcode.QRCodeOptions): Promise<string> => {
    return qrcode.toDataURL(url, options);
};
