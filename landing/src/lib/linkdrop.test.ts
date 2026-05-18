import { describe, expect, it } from "vitest";

import { buildWhatsAppLink, getQrDownloadFileName } from "./linkdrop";

describe("buildWhatsAppLink", () => {
	it("generates a link from an India-format phone value and custom message", () => {
		expect(
			buildWhatsAppLink({
				phone: "+91 98765 43210",
				customMessage: "Hi, I want to order from your catalog",
			}),
		).toBe(
			"https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20order%20from%20your%20catalog",
		);
	});

	it("strips non-digits from phone values", () => {
		expect(
			buildWhatsAppLink({
				phone: "+91 (98765) 43210",
				customMessage: "Send details",
			}),
		).toBe("https://wa.me/919876543210?text=Send%20details");
	});

	it("encodes emoji in the text query", () => {
		expect(
			buildWhatsAppLink({
				phone: "98765 43210",
				customMessage: "Can I buy this today? 😊",
			}),
		).toBe("https://wa.me/9876543210?text=Can%20I%20buy%20this%20today%3F%20%F0%9F%98%8A");
	});

	it("trims surrounding message whitespace", () => {
		expect(
			buildWhatsAppLink({
				phone: "98765 43210",
				customMessage: "  Send the invoice link  ",
			}),
		).toBe("https://wa.me/9876543210?text=Send%20the%20invoice%20link");
	});
});

describe("getQrDownloadFileName", () => {
	it("uses a fixed png file name", () => {
		expect(getQrDownloadFileName()).toBe("linkdrop-qr.png");
	});
});
