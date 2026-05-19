import { describe, expect, it } from "vitest";

import { getLocaleContent, getLocalePath } from "./i18n";

describe("i18n", () => {
	it("returns English root paths and Malay localized paths", () => {
		expect(getLocalePath("en")).toBe("/");
		expect(getLocalePath("ms")).toBe("/ms/");
	});

	it("provides locale-specific phone defaults and built-in preset copy", () => {
		const english = getLocaleContent("en");
		const malay = getLocaleContent("ms");

		expect(english.landing.form.phone.defaultCountry).toBe("IN");
		expect(english.landing.form.phone.placeholder).toBe("+91 98765 43210");
		expect(english.landing.form.presets.builtIn[0]).toEqual({
			label: "Order inquiry",
			message: "Hi, I want to place an order from your catalog.",
		});

		expect(malay.landing.form.phone.defaultCountry).toBe("MY");
		expect(malay.landing.form.phone.placeholder).toBe("+60 12-345 6789");
		expect(malay.landing.form.presets.builtIn[0]).toEqual({
			label: "Pertanyaan pesanan",
			message: "Hai, saya mahu membuat pesanan daripada katalog anda.",
		});
	});
});
