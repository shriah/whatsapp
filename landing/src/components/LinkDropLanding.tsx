import { useState } from "react";

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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function LinkDropLanding() {
	const [generatedLink, setGeneratedLink] = useState("");
	const [error, setError] = useState("");
	const [copyStatus, setCopyStatus] = useState("Copy link");
	const [missingFields, setMissingFields] = useState({
		phone: false,
		product: false,
	});

	function buildLink(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setCopyStatus("Copy link");

		const formData = new FormData(event.currentTarget);
		const phone = String(formData.get("phone") || "");
		const product = String(formData.get("product") || "");
		const price = String(formData.get("price") || "");
		const customMessage = String(formData.get("customMessage") || "");
		const sanitizedPhone = phone.replace(/\D/g, "");
		const trimmedProduct = product.trim();
		const trimmedPrice = price.trim();
		const trimmedCustomMessage = customMessage.trim();
		const missing = {
			phone: !sanitizedPhone,
			product: !trimmedProduct,
		};

		setMissingFields(missing);

		if (missing.phone || missing.product) {
			setError("Add a WhatsApp phone number and product name before building your link.");
			setGeneratedLink("");
			return;
		}

		const message = trimmedCustomMessage
			? trimmedCustomMessage
			: trimmedPrice
				? `Hi, I want to buy ${trimmedProduct} for ${trimmedPrice}`
				: `Hi, I want to buy ${trimmedProduct}`;

		setError("");
		setGeneratedLink(`https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`);
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

	function copyLinkFromPointer(event: React.PointerEvent<HTMLButtonElement>) {
		event.preventDefault();
		copyLink();
	}

	function copyLinkFromMouse(event: React.MouseEvent<HTMLButtonElement>) {
		event.preventDefault();
		copyLink();
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
								Launch product chats in one tap
							</h1>
							<p className="max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
								Turn Instagram posts, catalog items, stories, and DM replies into a direct
								WhatsApp buying chat with a clean product link.
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
											Add product details and create a buyer-ready wa.me link.
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

								<div className="grid gap-4 sm:grid-cols-2">
									<div className="flex flex-col gap-2">
										<Label htmlFor="phone">WhatsApp phone number</Label>
										<Input
											id="phone"
											name="phone"
											inputMode="tel"
											placeholder="+91 98765 43210"
											aria-invalid={missingFields.phone}
										/>
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="product">Product name</Label>
										<Input
											id="product"
											name="product"
											placeholder="Handmade linen tote"
											aria-invalid={missingFields.product}
										/>
									</div>
								</div>

								<div className="grid gap-4 sm:grid-cols-[0.55fr_1fr]">
									<div className="flex flex-col gap-2">
										<Label htmlFor="price">Price</Label>
										<Input id="price" name="price" placeholder="Rs. 1,499" />
									</div>
									<div className="flex flex-col gap-2">
										<Label htmlFor="custom-message">Custom message</Label>
										<Textarea
											id="custom-message"
											name="customMessage"
											placeholder="Hi, I want to buy the linen tote from your catalog."
										/>
									</div>
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
									onMouseDown={copyLinkFromMouse}
									onPointerDown={copyLinkFromPointer}
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
								LinkDrop does one job now: it builds a WhatsApp product link you can share
								where buyers already discover your products.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-3">
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 1</Badge>
									<CardTitle>Add product details</CardTitle>
									<CardDescription>
										Enter the seller number, product name, optional price, and message.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 2</Badge>
									<CardTitle>Generate the WhatsApp link</CardTitle>
									<CardDescription>
										The generator strips phone formatting and encodes the buyer message.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<Badge variant="outline">Step 3</Badge>
									<CardTitle>Share it with buyers</CardTitle>
									<CardDescription>
										Use the link in stories, catalogs, posts, DMs, or product notes.
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</div>
				</section>

				<section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
					<div className="flex max-w-2xl flex-col gap-2">
						<h2 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
							Build your next product link
						</h2>
						<p className="text-muted-foreground">
							Create a direct WhatsApp chat URL and place it wherever buyers ask about your
							products.
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
