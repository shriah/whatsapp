import type { Country } from "react-phone-number-input";

export const SUPPORTED_LOCALES = ["en", "ms"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type BuiltInPreset = {
	label: string;
	message: string;
};

export type LocaleContent = {
	layout: {
		title: string;
		description: string;
		structuredDataDescription: string;
		featureList: string[];
	};
	landing: {
		brandName: string;
		languageSwitcher: {
			label: string;
			english: string;
			malay: string;
		};
		nav: {
			generator: string;
			howItWorks: string;
			faq: string;
		};
		hero: {
			badge: string;
			title: string;
			description: string;
			primaryCta: string;
			secondaryCta: string;
			finalCta: string;
		};
		form: {
			title: string;
			description: string;
			phone: {
				label: string;
				hint: string;
				placeholder: string;
				defaultCountry: Country;
			};
			message: {
				label: string;
				placeholder: string;
				hint: string;
			};
			emoji: {
				button: string;
			};
			submit: {
				idle: string;
				loading: string;
				requirements: string;
			};
			error: {
				title: string;
				validation: string;
				qr: string;
			};
			recents: {
				label: string;
				description: string;
				empty: string;
				usePrefix: string;
			};
			presets: {
				label: string;
				description: string;
				builtInLabel: string;
				builtInHint: string;
				customLabel: string;
				labelField: string;
				messageField: string;
				labelPlaceholder: string;
				messagePlaceholder: string;
				addButton: string;
				updateButton: string;
				cancelButton: string;
				empty: string;
				limit: string;
				savedSuffix: string;
				usePrefix: string;
				editPrefix: string;
				deletePrefix: string;
				useButton: string;
				editButton: string;
				deleteButton: string;
				builtIn: readonly BuiltInPreset[];
			};
		};
		results: {
			eyebrow: string;
			title: string;
			description: string;
			generatedLinkLabel: string;
			generatedLinkPlaceholder: string;
			copyIdle: string;
			copyDone: string;
			open: string;
			download: string;
			qrBadge: string;
			qrAlt: string;
			qrReady: string;
			qrEmpty: string;
		};
		howItWorks: {
			title: string;
			description: string;
			steps: { badge: string; title: string; description: string }[];
		};
		explainer: {
			title: string;
			description: string;
			exampleTitle: string;
			exampleDescription: string;
			exampleLink: string;
		};
		useCases: {
			title: string;
			description: string;
			cards: { title: string; description: string }[];
		};
		faq: {
			title: string;
			description: string;
			items: { question: string; answer: string }[];
		};
		finalCta: {
			title: string;
			description: string;
			button: string;
		};
	};
};

const siteUrl = "https://linkbasket.in/";

export function getLocalePath(locale: Locale) {
	return locale === "en" ? "/" : `/${locale}/`;
}

export function getLocaleUrl(locale: Locale) {
	return new URL(getLocalePath(locale), siteUrl).toString();
}

const localeContent: Record<Locale, LocaleContent> = {
	en: {
		layout: {
			title: "WhatsApp Link Generator | Create a WhatsApp Link with Link Basket",
			description:
				"Create a WhatsApp link with a pre-filled message in your browser. Link Basket builds free wa.me links and QR codes for sellers, catalogs, DMs, and printed material.",
			structuredDataDescription:
				"Create a WhatsApp link with a pre-filled message in your browser. Link Basket builds free wa.me links and QR codes for sellers, catalogs, DMs, and printed material.",
			featureList: [
				"Create wa.me WhatsApp links",
				"Add a pre-filled WhatsApp message",
				"Copy or open generated links",
				"Download a client-side QR code PNG",
			],
		},
		landing: {
			brandName: "Link Basket",
			languageSwitcher: {
				label: "Language",
				english: "English",
				malay: "Bahasa Melayu",
			},
			nav: {
				generator: "Generator",
				howItWorks: "How it works",
				faq: "FAQ",
			},
			hero: {
				badge: "Static wa.me builder",
				title: "Build a WhatsApp chat link buyers can use in one tap.",
				description:
					"Add your number, shape the opening message, and export the same share-ready wa.me link as copy, QR, or a WhatsApp launch.",
				primaryCta: "Build my link",
				secondaryCta: "See how it works",
				finalCta: "Start free",
			},
			form: {
				title: "WhatsApp link generator",
				description:
					"Keep the essentials in view, then pull from presets or recent builds when you need a faster starting point.",
				phone: {
					label: "WhatsApp phone number",
					hint: "Use the number buyers should reach directly in WhatsApp.",
					placeholder: "+91 98765 43210",
					defaultCountry: "IN",
				},
				message: {
					label: "Message",
					placeholder: "Hi, I want to place an order from your catalog.",
					hint: "This becomes the encoded text= value in your wa.me link.",
				},
				emoji: {
					button: "Insert emoji",
				},
				submit: {
					idle: "Build my link",
					loading: "Building...",
					requirements: "Phone number and message are both required before the link can be built.",
				},
				error: {
					title: "Missing details",
					validation: "Add a valid WhatsApp phone number and message before building your link.",
					qr: "We couldn't generate the QR code right now. Try again.",
				},
				recents: {
					label: "Recent messages",
					description: "Last successful drafts, ready to reuse without rebuilding automatically.",
					empty: "Recent messages appear here after you build a valid link.",
					usePrefix: "Use recent message",
				},
				presets: {
					label: "Presets",
					description: "Built-in openers plus your saved repeat-use chat starters.",
					builtInLabel: "Built-in presets",
					builtInHint: "Apply first, then build",
					customLabel: "Custom presets",
					labelField: "Preset label",
					messageField: "Preset message",
					labelPlaceholder: "Catalog follow-up",
					messagePlaceholder: "Hi, can you share the latest catalog?",
					addButton: "Add preset",
					updateButton: "Update preset",
					cancelButton: "Cancel edit",
					empty: "Save your own repeat-use chat starters here.",
					limit: "You can save up to 10 custom presets.",
					savedSuffix: "saved",
					usePrefix: "Use preset",
					editPrefix: "Edit preset",
					deletePrefix: "Delete preset",
					useButton: "Use",
					editButton: "Edit",
					deleteButton: "Delete",
					builtIn: [
						{
							label: "Order inquiry",
							message: "Hi, I want to place an order from your catalog.",
						},
						{
							label: "Catalog request",
							message: "Hi, please share your latest catalog.",
						},
						{
							label: "Price check",
							message: "Hi, can you share the price for this item?",
						},
						{
							label: "Availability check",
							message: "Hi, is this item available right now?",
						},
						{
							label: "Custom order",
							message: "Hi, I want to discuss a custom order.",
						},
					],
				},
			},
			results: {
				eyebrow: "Results",
				title: "Ready to share",
				description: "Copy the link, open it in WhatsApp, or export the matching QR code.",
				generatedLinkLabel: "Generated link",
				generatedLinkPlaceholder: "Build a link to see the wa.me URL",
				copyIdle: "Copy link",
				copyDone: "Copied",
				open: "Open in WhatsApp",
				download: "Download QR",
				qrBadge: "Share-ready QR",
				qrAlt: "QR code for the generated WhatsApp link",
				qrReady: "Download this PNG for cards, packaging, posters, or in-store prompts.",
				qrEmpty: "Build a link first to preview the QR code that opens the same WhatsApp chat.",
			},
			howItWorks: {
				title: "How to create a WhatsApp link",
				description:
					"Link Basket creates one static WhatsApp link you can share anywhere buyers already find you. The generated URL uses WhatsApp's wa.me format and does not require a backend.",
				steps: [
					{
						badge: "Step 1",
						title: "Add your number",
						description:
							"Choose the country code and enter the WhatsApp number that should receive buyer chats.",
					},
					{
						badge: "Step 2",
						title: "Write the message",
						description:
							"Create the exact chat starter buyers will see, including emoji when it fits your brand.",
					},
					{
						badge: "Step 3",
						title: "Share it with buyers",
						description:
							"Copy the link, open it in WhatsApp, or download the QR code for packaging and displays.",
					},
				],
			},
			explainer: {
				title: "What is a WhatsApp link?",
				description:
					"A WhatsApp link is a URL that opens a chat with a specific phone number. When the link includes a text query, WhatsApp also fills the message box with your chosen message so the buyer can review it and send.",
				exampleTitle: "Example wa.me output",
				exampleDescription: "Link Basket keeps the generated link simple and portable.",
				exampleLink:
					"https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20order%20from%20your%20catalog",
			},
			useCases: {
				title: "Where to use your WhatsApp link",
				description:
					"Use one generated link across digital and offline touchpoints so every buyer starts with the same clear message.",
				cards: [
					{
						title: "Seller profiles",
						description:
							"Add your WhatsApp link to Instagram bios, story stickers, marketplace profiles, and saved DM replies.",
					},
					{
						title: "Catalogs and product posts",
						description:
							"Point buyers to a chat starter for orders, size questions, availability, or delivery details.",
					},
					{
						title: "QR codes and print",
						description:
							"Download the QR code for flyers, packages, counters, menus, and printed material that should open the same chat.",
					},
				],
			},
			faq: {
				title: "WhatsApp link questions",
				description: "Short answers for sellers who want a direct chat link without extra setup.",
				items: [
					{
						question: "Do I need the WhatsApp Business API?",
						answer:
							"No. Link Basket only creates a static wa.me link. Buyers open the link in WhatsApp and send the message themselves.",
					},
					{
						question: "What phone number format should I use?",
						answer:
							"Enter a valid WhatsApp number with the country code. Link Basket removes spaces and symbols before building the final digits-only URL.",
					},
					{
						question: "Can I create a WhatsApp link with emoji?",
						answer:
							"Yes. Add emoji in the message field and Link Basket encodes the text query so the generated link stays shareable.",
					},
					{
						question: "Is the QR code based on the same link?",
						answer:
							"Yes. The QR code is generated in your browser from the exact WhatsApp link shown in the generated link field.",
					},
				],
			},
			finalCta: {
				title: "Create a WhatsApp link now",
				description: "Create a direct chat URL and place it wherever buyers are ready to ask.",
				button: "Start free",
			},
		},
	},
	ms: {
		layout: {
			title: "Penjana Pautan WhatsApp | Cipta Pautan WhatsApp dengan Link Basket",
			description:
				"Cipta pautan WhatsApp dengan mesej siap diisi terus dalam pelayar anda. Link Basket membina pautan wa.me percuma dan kod QR untuk penjual, katalog, DM, dan bahan bercetak.",
			structuredDataDescription:
				"Cipta pautan WhatsApp dengan mesej siap diisi terus dalam pelayar anda. Link Basket membina pautan wa.me percuma dan kod QR untuk penjual, katalog, DM, dan bahan bercetak.",
			featureList: [
				"Cipta pautan WhatsApp wa.me",
				"Tambahkan mesej WhatsApp yang siap diisi",
				"Salin atau buka pautan yang dijana",
				"Muat turun PNG kod QR yang dijana dalam pelayar",
			],
		},
		landing: {
			brandName: "Link Basket",
			languageSwitcher: {
				label: "Bahasa",
				english: "English",
				malay: "Bahasa Melayu",
			},
			nav: {
				generator: "Penjana",
				howItWorks: "Cara ia berfungsi",
				faq: "Soalan lazim",
			},
			hero: {
				badge: "Pembina wa.me statik",
				title: "Bina pautan WhatsApp yang boleh digunakan pembeli dengan satu ketikan.",
				description:
					"Tambah nombor anda, bentuk mesej pembukaan, dan eksport pautan wa.me yang sama sebagai salinan, QR, atau terus buka ke WhatsApp.",
				primaryCta: "Bina pautan saya",
				secondaryCta: "Lihat cara ia berfungsi",
				finalCta: "Mula percuma",
			},
			form: {
				title: "Penjana pautan WhatsApp",
				description:
					"Kekalkan perkara penting dalam pandangan, kemudian guna preset atau binaan terkini apabila anda perlukan titik mula yang lebih pantas.",
				phone: {
					label: "Nombor telefon WhatsApp",
					hint: "Gunakan nombor yang patut dihubungi pembeli terus di WhatsApp.",
					placeholder: "+60 12-345 6789",
					defaultCountry: "MY",
				},
				message: {
					label: "Mesej",
					placeholder: "Hai, saya mahu membuat pesanan daripada katalog anda.",
					hint: "Ini menjadi nilai text= yang dikodkan dalam pautan wa.me anda.",
				},
				emoji: {
					button: "Masukkan emoji",
				},
				submit: {
					idle: "Bina pautan saya",
					loading: "Sedang membina...",
					requirements:
						"Nombor telefon dan mesej kedua-duanya diperlukan sebelum pautan boleh dibina.",
				},
				error: {
					title: "Maklumat belum lengkap",
					validation:
						"Tambah nombor telefon WhatsApp yang sah dan mesej sebelum membina pautan anda.",
					qr: "Kami tidak dapat menjana kod QR sekarang. Cuba lagi.",
				},
				recents: {
					label: "Mesej terkini",
					description: "Draf terakhir yang berjaya, sedia diguna semula tanpa membina semula secara automatik.",
					empty: "Mesej terkini akan muncul di sini selepas anda membina pautan yang sah.",
					usePrefix: "Guna mesej terkini",
				},
				presets: {
					label: "Preset",
					description: "Mesej pembuka terbina dalam bersama pemula chat berulang yang anda simpan.",
					builtInLabel: "Preset terbina dalam",
					builtInHint: "Guna dahulu, kemudian bina",
					customLabel: "Preset tersuai",
					labelField: "Label preset",
					messageField: "Mesej preset",
					labelPlaceholder: "Susulan katalog",
					messagePlaceholder: "Hai, boleh kongsi katalog terkini?",
					addButton: "Tambah preset",
					updateButton: "Kemas kini preset",
					cancelButton: "Batal edit",
					empty: "Simpan pemula chat berulang anda di sini.",
					limit: "Anda boleh simpan sehingga 10 preset tersuai.",
					savedSuffix: "disimpan",
					usePrefix: "Guna preset",
					editPrefix: "Edit preset",
					deletePrefix: "Padam preset",
					useButton: "Guna",
					editButton: "Edit",
					deleteButton: "Padam",
					builtIn: [
						{
							label: "Pertanyaan pesanan",
							message: "Hai, saya mahu membuat pesanan daripada katalog anda.",
						},
						{
							label: "Permintaan katalog",
							message: "Hai, sila kongsi katalog terkini anda.",
						},
						{
							label: "Semakan harga",
							message: "Hai, boleh kongsi harga untuk item ini?",
						},
						{
							label: "Semakan ketersediaan",
							message: "Hai, adakah item ini tersedia sekarang?",
						},
						{
							label: "Pesanan tersuai",
							message: "Hai, saya mahu berbincang tentang pesanan tersuai.",
						},
					],
				},
			},
			results: {
				eyebrow: "Hasil",
				title: "Sedia untuk dikongsi",
				description: "Salin pautan, bukanya dalam WhatsApp, atau eksport kod QR yang sepadan.",
				generatedLinkLabel: "Pautan yang dijana",
				generatedLinkPlaceholder: "Bina pautan untuk melihat URL wa.me",
				copyIdle: "Salin pautan",
				copyDone: "Disalin",
				open: "Buka di WhatsApp",
				download: "Muat turun QR",
				qrBadge: "QR sedia kongsi",
				qrAlt: "Kod QR untuk pautan WhatsApp yang dijana",
				qrReady:
					"Muat turun PNG ini untuk kad, pembungkusan, poster, atau arahan dalam kedai.",
				qrEmpty:
					"Bina pautan dahulu untuk pratonton kod QR yang membuka chat WhatsApp yang sama.",
			},
			howItWorks: {
				title: "Cara mencipta pautan WhatsApp",
				description:
					"Link Basket mencipta satu pautan WhatsApp statik yang boleh anda kongsi di mana sahaja pembeli sudah menemui anda. URL yang dijana menggunakan format wa.me WhatsApp dan tidak memerlukan backend.",
				steps: [
					{
						badge: "Langkah 1",
						title: "Tambah nombor anda",
						description:
							"Pilih kod negara dan masukkan nombor WhatsApp yang patut menerima chat pembeli.",
					},
					{
						badge: "Langkah 2",
						title: "Tulis mesej",
						description:
							"Cipta pemula chat yang tepat untuk dilihat pembeli, termasuk emoji jika sesuai dengan jenama anda.",
					},
					{
						badge: "Langkah 3",
						title: "Kongsi dengan pembeli",
						description:
							"Salin pautan, bukanya dalam WhatsApp, atau muat turun kod QR untuk pembungkusan dan paparan.",
					},
				],
			},
			explainer: {
				title: "Apakah pautan WhatsApp?",
				description:
					"Pautan WhatsApp ialah URL yang membuka chat dengan nombor telefon tertentu. Apabila pautan mengandungi pertanyaan teks, WhatsApp juga mengisi kotak mesej dengan mesej pilihan anda supaya pembeli boleh menyemak dan menghantarnya.",
				exampleTitle: "Contoh output wa.me",
				exampleDescription: "Link Basket memastikan pautan yang dijana kekal ringkas dan mudah dibawa.",
				exampleLink:
					"https://wa.me/60123456789?text=Hai%2C%20saya%20mahu%20membuat%20pesanan%20daripada%20katalog%20anda.",
			},
			useCases: {
				title: "Di mana hendak menggunakan pautan WhatsApp anda",
				description:
					"Guna satu pautan yang dijana merentas titik sentuhan digital dan luar talian supaya setiap pembeli bermula dengan mesej yang sama dan jelas.",
				cards: [
					{
						title: "Profil penjual",
						description:
							"Tambah pautan WhatsApp anda pada bio Instagram, pelekat story, profil marketplace, dan balasan DM yang disimpan.",
					},
					{
						title: "Katalog dan pos produk",
						description:
							"Arahkan pembeli ke pemula chat untuk pesanan, soalan saiz, ketersediaan, atau butiran penghantaran.",
					},
					{
						title: "Kod QR dan cetakan",
						description:
							"Muat turun kod QR untuk risalah, bungkusan, kaunter, menu, dan bahan bercetak yang patut membuka chat yang sama.",
					},
				],
			},
			faq: {
				title: "Soalan tentang pautan WhatsApp",
				description: "Jawapan ringkas untuk penjual yang mahu pautan chat terus tanpa persediaan tambahan.",
				items: [
					{
						question: "Adakah saya perlukan WhatsApp Business API?",
						answer:
							"Tidak. Link Basket hanya mencipta pautan wa.me statik. Pembeli membuka pautan itu dalam WhatsApp dan menghantar mesej sendiri.",
					},
					{
						question: "Format nombor telefon apa yang patut saya gunakan?",
						answer:
							"Masukkan nombor WhatsApp yang sah bersama kod negara. Link Basket membuang ruang dan simbol sebelum membina URL akhir yang mengandungi nombor sahaja.",
					},
					{
						question: "Bolehkah saya mencipta pautan WhatsApp dengan emoji?",
						answer:
							"Ya. Tambah emoji dalam medan mesej dan Link Basket mengekodkan pertanyaan teks supaya pautan yang dijana kekal mudah dikongsi.",
					},
					{
						question: "Adakah kod QR berdasarkan pautan yang sama?",
						answer:
							"Ya. Kod QR dijana dalam pelayar anda daripada pautan WhatsApp yang sama seperti yang ditunjukkan dalam medan pautan yang dijana.",
					},
				],
			},
			finalCta: {
				title: "Cipta pautan WhatsApp sekarang",
				description: "Cipta URL chat terus dan letakkannya di tempat pembeli bersedia untuk bertanya.",
				button: "Mula percuma",
			},
		},
	},
};

export function getLocaleContent(locale: Locale) {
	return localeContent[locale];
}
