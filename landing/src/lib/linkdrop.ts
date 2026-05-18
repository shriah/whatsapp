export type LinkDropFormValues = {
	phone: string;
	customMessage: string;
};

export function buildWhatsAppLink({ phone, customMessage }: LinkDropFormValues) {
	const sanitizedPhone = phone.replace(/\D/g, "");
	const trimmedCustomMessage = customMessage.trim();

	return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(trimmedCustomMessage)}`;
}

export function getQrDownloadFileName() {
	return "linkdrop-qr.png";
}
