import { useRef, useState } from "react";
import type { Value } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import QRCode from "qrcode";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { buildWhatsAppLink, getQrDownloadFileName } from "@/lib/linkdrop";

export default function LinkDropLanding() {
	const [phone, setPhone] = useState<Value>();
	const [customMessage, setCustomMessage] = useState("");
	const [generatedLink, setGeneratedLink] = useState("");
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [error, setError] = useState("");
	const [copyStatus, setCopyStatus] = useState("Copy link");
	const [missingFields, setMissingFields] = useState({
		phone: false,
		customMessage: false,
	});
	const messageRef = useRef<HTMLTextAreaElement>(null);

	async function buildLink(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setCopyStatus("Copy link");

		const trimmedMessage = customMessage.trim();
		const missing = {
			phone: !phone || !isValidPhoneNumber(phone),
			customMessage: !trimmedMessage,
		};

		setMissingFields(missing);

		if (missing.phone || missing.customMessage) {
			setError("Add a valid WhatsApp phone number and message before building your link.");
			setGeneratedLink("");
			setQrCodeUrl("");
			return;
		}

		const link = buildWhatsAppLink({
			phone,
			customMessage,
		});
		const qrCode = await QRCode.toDataURL(link, {
			errorCorrectionLevel: "M",
			margin: 2,
			width: 640,
		});

		setError("");
		setGeneratedLink(link);
		setQrCodeUrl(qrCode);
	}

	function insertEmoji(emojiData: EmojiClickData) {
		const emoji = emojiData.emoji;
		const textarea = messageRef.current;

		if (!textarea) {
			setCustomMessage((currentMessage) => `${currentMessage}${emoji}`);
			return;
		}

		const selectionStart = textarea.selectionStart ?? customMessage.length;
		const selectionEnd = textarea.selectionEnd ?? customMessage.length;
		const nextMessage =
			customMessage.slice(0, selectionStart) + emoji + customMessage.slice(selectionEnd);
		const nextCursorPosition = selectionStart + emoji.length;

		setCustomMessage(nextMessage);

		window.requestAnimationFrame(() => {
			textarea.focus();
			textarea.setSelectionRange(nextCursorPosition, nextCursorPosition);
		});
	}

	function copyLink() {
		const value = (document.getElementById("generated-link") as HTMLInputElement | null)?.value || "";

		if (!value) {
			return;
		}

		setCopyStatus("Copied");
		window.setTimeout(() => setCopyStatus("Copy link"), 1800);

		try {
			void navigator.clipboard.writeText(value).catch(() => {
				copyWithFallback(value);
			});
		} catch {
			copyWithFallback(value);
		}
	}

	function copyWithFallback(value: string) {
		const textarea = document.createElement("textarea");
		textarea.value = value;
		textarea.setAttribute("readonly", "");
		textarea.style.position = "fixed";
		textarea.style.opacity = "0";
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		document.body.removeChild(textarea);
	}

	function downloadQrCode() {
		if (!qrCodeUrl) {
			return;
		}

		const anchor = document.createElement("a");
		anchor.href = qrCodeUrl;
		anchor.download = getQrDownloadFileName();
		anchor.click();
	}

	return (
		<div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,_var(--primary)_18%,_transparent),_transparent_34%),linear-gradient(135deg,_color-mix(in_oklch,_var(--secondary)_78%,_white),_var(--background)_45%,_color-mix(in_oklch,_var(--accent)_50%,_white))]">
			<header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
				<a href="#top" className="text-lg font-semibold tracking-normal text-foreground">
					LinkDrop
				</a>
				<nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
					<a className="transition-colors hover:text-foreground" href="#generator">
						Generator
					</a>
					<a className="transition-colors hover:text-foreground" href="#how-it-works">
						How it works
					</a>
				</nav>
				<Button asChild size="sm">
					<a href="#generator">Start free</a>
				</Button>
			</header>

			<main id="top">
				<section className="mx-auto grid w-full max-w-7xl items-center gap-10 px-5 pb-16 pt-8 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:pb-24 lg:pt-14">
					<div className="flex flex-col gap-8">
						<div className="flex max-w-2xl flex-col gap-6">
							<h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl lg:text-7xl">
								Launch WhatsApp chats in one tap
							</h1>
							<p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
								Turn posts, stories, DMs, catalogs, and printed prompts into a direct
								WhatsApp chat with your own ready-to-send message.
							</p>
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild size="lg">
								<a href="#generator">Build my link</a>
							</Button>
							<Button asChild variant="outline" size="lg">
								<a href="#how-it-works">See how it works</a>
							</Button>
						</div>
					</div>

					<form id="generator" className="scroll-mt-8" onSubmit={buildLink}>
						<Card className="border-primary/20 bg-card/95 shadow-2xl shadow-primary/10">
							<CardHeader>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="flex flex-col gap-1.5">
										<CardTitle>WhatsApp link generator</CardTitle>
										<CardDescription>
											Add a number and message to create a share-ready wa.me link.
										</CardDescription>
									</div>
									<Badge variant="secondary">Local preview</Badge>
								</div>
							</CardHeader>
							<CardContent className="flex flex-col gap-5">
								{error ? (
									<Alert variant="destructive">
										<AlertTitle>Missing details</AlertTitle>
										<AlertDescription>{error}</AlertDescription>
									</Alert>
								) : null}

								<div className="flex flex-col gap-2">
									<Label htmlFor="phone">WhatsApp phone number</Label>
									<PhoneInput
										id="phone"
										name="phone"
										defaultCountry="IN"
										value={phone}
										onChange={setPhone}
										placeholder="+91 98765 43210"
										aria-invalid={missingFields.phone}
									/>
								</div>

								<div className="flex flex-col gap-2">
									<div className="flex items-center justify-between gap-3">
										<Label htmlFor="custom-message">Message</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													type="button"
													variant="outline"
													size="sm"
													aria-label="Insert emoji"
													title="Insert emoji"
												>
													<SmilePlus aria-hidden="true" />
													Emoji
												</Button>
											</PopoverTrigger>
											<PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
												<EmojiPicker
													width="100%"
													height={360}
													previewConfig={{ showPreview: false }}
													onEmojiClick={insertEmoji}
												/>
											</PopoverContent>
										</Popover>
									</div>
									<Textarea
										ref={messageRef}
										id="custom-message"
										name="customMessage"
										value={customMessage}
										onChange={(event) => setCustomMessage(event.target.value)}
										placeholder="Hi, I want to place an order from your catalog."
										aria-invalid={missingFields.customMessage}
										className="min-h-28"
									/>
								</div>

								<Separator />

								<div className="flex flex-col gap-2">
									<Label htmlFor="generated-link">Generated link</Label>
									<Input
										id="generated-link"
										readOnly
										value={generatedLink}
										placeholder="Build a link to see the wa.me URL"
									/>
								</div>

								{generatedLink ? (
									<div className="grid gap-4 rounded-lg border bg-secondary/50 p-4 sm:grid-cols-[160px_1fr] sm:items-center">
										<div className="flex aspect-square items-center justify-center rounded-md border bg-background p-3">
											<img
												src={qrCodeUrl}
												alt="QR code for the generated WhatsApp link"
												className="size-full"
											/>
										</div>
										<div className="flex flex-col gap-2">
											<Badge variant="outline">Share-ready QR</Badge>
											<p className="text-sm leading-6 text-muted-foreground">
												Download this QR code for print cards, packages, story highlights, or
												in-store displays. Scanning it opens the same WhatsApp chat.
											</p>
										</div>
									</div>
								) : null}
							</CardContent>
							<CardFooter className="flex flex-col gap-3 sm:flex-row">
								<Button className="w-full sm:w-auto" type="submit">
									Build my link
								</Button>
								<Button
									className="w-full sm:w-auto"
									type="button"
									variant="secondary"
									disabled={!generatedLink}
									onClick={copyLink}
								>
									{copyStatus}
								</Button>
								<Button className="w-full sm:w-auto" variant="outline" asChild>
									<a
										href={generatedLink || "#generator"}
										target={generatedLink ? "_blank" : undefined}
										rel={generatedLink ? "noreferrer" : undefined}
										aria-disabled={!generatedLink}
									>
										Open in WhatsApp
									</a>
								</Button>
								<Button
									className="w-full sm:w-auto"
									type="button"
									variant="outline"
									disabled={!qrCodeUrl}
									onClick={downloadQrCode}
								>
									Download QR
								</Button>
							</CardFooter>
						</Card>
					</form>
				</section>

				<section id="how-it-works" className="scroll-mt-8 border-y bg-card/70">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:py-20">
						<div className="flex max-w-2xl flex-col gap-3">
							<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
								How it works
							</h2>
							<p className="text-base leading-7 text-muted-foreground">
								LinkDrop builds one static WhatsApp link you can share anywhere buyers
								already find you.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-3">
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 1</Badge>
									<CardTitle>Add your number</CardTitle>
									<CardDescription>
										Choose the country code and enter the WhatsApp number that should receive
										buyer chats.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 2</Badge>
									<CardTitle>Write the message</CardTitle>
									<CardDescription>
										Create the exact chat starter buyers will see, including emoji when it
										fits your brand.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 3</Badge>
									<CardTitle>Share it with buyers</CardTitle>
									<CardDescription>
										Copy the link, open it in WhatsApp, or download the QR code for packaging
										and displays.
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</div>
				</section>

				<section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
					<div className="flex max-w-2xl flex-col gap-2">
						<h2 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
							Build your next WhatsApp link
						</h2>
						<p className="text-muted-foreground">
							Create a direct chat URL and place it wherever buyers are ready to ask.
						</p>
					</div>
					<Button asChild size="lg">
						<a href="#generator">Start free</a>
					</Button>
				</section>
			</main>
		</div>
	);
}
