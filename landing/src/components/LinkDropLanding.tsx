import React, { useEffect, useRef, useState } from "react";
import type { Value } from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { ChevronDown, SmilePlus } from "lucide-react";
import QRCode from "qrcode";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
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
import {
	addRecentMessage,
	BUILT_IN_PRESETS,
	createCustomPreset,
	defaultPersistedLinkDropState,
	deleteCustomPreset,
	loadPersistedLinkDropState,
	MAX_CUSTOM_PRESETS,
	savePersistedLinkDropState,
	updateCustomPreset,
	type CustomPreset,
} from "@/lib/linkdrop-storage";
import { cn } from "@/lib/utils";

function createPresetId() {
	if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
		return crypto.randomUUID();
	}

	return `preset-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function LinkDropLanding() {
	const [phone, setPhone] = useState<Value>();
	const [customMessage, setCustomMessage] = useState("");
	const [recentMessages, setRecentMessages] = useState<string[]>([]);
	const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
	const [presetLabel, setPresetLabel] = useState("");
	const [presetMessage, setPresetMessage] = useState("");
	const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
	const [isRecentTrayOpen, setIsRecentTrayOpen] = useState(false);
	const [isPresetTrayOpen, setIsPresetTrayOpen] = useState(false);
	const [generatedLink, setGeneratedLink] = useState("");
	const [qrCodeUrl, setQrCodeUrl] = useState("");
	const [buildError, setBuildError] = useState("");
	const [copyStatus, setCopyStatus] = useState("Copy link");
	const [hasAttemptedBuild, setHasAttemptedBuild] = useState(false);
	const [isBuilding, setIsBuilding] = useState(false);
	const [hasHydratedPersistedState, setHasHydratedPersistedState] = useState(false);
	const buildRequestRef = useRef(0);
	const copyStatusTimeoutRef = useRef<number | null>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const phoneInputRef = useRef<HTMLInputElement>(null);
	const messageRef = useRef<HTMLTextAreaElement>(null);
	const presetLabelRef = useRef<HTMLInputElement>(null);
	const trimmedMessage = customMessage.trim();
	const isPhoneMissing = hasAttemptedBuild && (!phone || !isValidPhoneNumber(phone));
	const isMessageMissing = hasAttemptedBuild && !trimmedMessage;
	const validationError =
		isPhoneMissing || isMessageMissing
			? "Add a valid WhatsApp phone number and message before building your link."
			: "";
	const error = buildError || validationError;

	useEffect(() => {
		return () => {
			if (copyStatusTimeoutRef.current) {
				window.clearTimeout(copyStatusTimeoutRef.current);
			}
		};
	}, []);

	useEffect(() => {
		const persistedState = loadPersistedLinkDropState();

		setPhone(persistedState.phone);
		setCustomMessage(persistedState.draftMessage);
		setRecentMessages(persistedState.recentMessages);
		setCustomPresets(persistedState.customPresets);
		setHasHydratedPersistedState(true);
	}, []);

	useEffect(() => {
		if (!hasHydratedPersistedState) {
			return;
		}

		savePersistedLinkDropState({
			version: defaultPersistedLinkDropState.version,
			phone,
			draftMessage: customMessage,
			recentMessages,
			customPresets,
		});
	}, [customMessage, customPresets, hasHydratedPersistedState, phone, recentMessages]);

	function clearGeneratedOutput() {
		setGeneratedLink("");
		setQrCodeUrl("");
	}

	function resetCopyStatus() {
		if (copyStatusTimeoutRef.current) {
			window.clearTimeout(copyStatusTimeoutRef.current);
			copyStatusTimeoutRef.current = null;
		}

		setCopyStatus("Copy link");
	}

	async function buildLink(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (isBuilding) {
			return;
		}

		setHasAttemptedBuild(true);
		resetCopyStatus();
		setBuildError("");

		if (!phone || !isValidPhoneNumber(phone) || !trimmedMessage) {
			clearGeneratedOutput();
			return;
		}

		const currentBuildRequest = buildRequestRef.current + 1;
		buildRequestRef.current = currentBuildRequest;
		const link = buildWhatsAppLink({
			phone,
			customMessage,
		});
		setIsBuilding(true);

		try {
			const qrCode = await QRCode.toDataURL(link, {
				errorCorrectionLevel: "M",
				margin: 2,
				width: 640,
			});

			if (buildRequestRef.current !== currentBuildRequest) {
				return;
			}

			setGeneratedLink(link);
			setQrCodeUrl(qrCode);
			setRecentMessages((currentMessages) => addRecentMessage(currentMessages, trimmedMessage));
		} catch {
			if (buildRequestRef.current !== currentBuildRequest) {
				return;
			}

			clearGeneratedOutput();
			setBuildError("We couldn't generate the QR code right now. Try again.");
		} finally {
			if (buildRequestRef.current === currentBuildRequest) {
				setIsBuilding(false);
			}
		}
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
		if (!generatedLink) {
			return;
		}

		setCopyStatus("Copied");
		if (copyStatusTimeoutRef.current) {
			window.clearTimeout(copyStatusTimeoutRef.current);
		}
		copyStatusTimeoutRef.current = window.setTimeout(() => {
			setCopyStatus("Copy link");
			copyStatusTimeoutRef.current = null;
		}, 1800);

		void copyToClipboard(generatedLink);
	}

	async function copyToClipboard(value: string) {
		try {
			await navigator.clipboard.writeText(value);
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

	function focusPhoneNumber() {
		formRef.current?.scrollIntoView({
			behavior: "smooth",
			block: "start",
		});
		phoneInputRef.current?.focus({ preventScroll: true });
	}

	function applyMessageTemplate(message: string) {
		setCustomMessage(message);
		messageRef.current?.focus();
	}

	function startEditingPreset(preset: CustomPreset) {
		setEditingPresetId(preset.id);
		setPresetLabel(preset.label);
		setPresetMessage(preset.message);
		setIsPresetTrayOpen(true);

		window.requestAnimationFrame(() => {
			presetLabelRef.current?.focus();
		});
	}

	function resetPresetForm() {
		setEditingPresetId(null);
		setPresetLabel("");
		setPresetMessage("");
	}

	function savePreset() {
		if (editingPresetId) {
			setCustomPresets((currentPresets) =>
				updateCustomPreset(currentPresets, {
					id: editingPresetId,
					label: presetLabel,
					message: presetMessage,
				}),
			);
			resetPresetForm();
			return;
		}

		setCustomPresets((currentPresets) =>
			createCustomPreset(
				currentPresets,
				{
					label: presetLabel,
					message: presetMessage,
				},
				createPresetId,
			),
		);
		resetPresetForm();
	}

	function removePreset(presetId: string) {
		setCustomPresets((currentPresets) => deleteCustomPreset(currentPresets, presetId));

		if (editingPresetId === presetId) {
			resetPresetForm();
		}
	}

	const isPresetFormValid = presetLabel.trim() && presetMessage.trim();
	const isCustomPresetLimitReached = customPresets.length >= MAX_CUSTOM_PRESETS && !editingPresetId;

	return (
		<div className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklch,_var(--primary)_14%,_transparent),_transparent_36%),linear-gradient(180deg,_color-mix(in_oklch,_var(--secondary)_80%,_white),_var(--background)_34%,_color-mix(in_oklch,_var(--accent)_34%,_white))]">
			<header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
				<a href="#top" className="text-lg font-semibold tracking-normal text-foreground">
					Link Basket
				</a>
				<nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground sm:flex">
					<a className="transition-colors hover:text-foreground" href="#generator">
						Generator
					</a>
					<a className="transition-colors hover:text-foreground" href="#how-it-works">
						How it works
					</a>
					<a className="transition-colors hover:text-foreground" href="#faq">
						FAQ
					</a>
				</nav>
				<Button asChild size="sm">
					<a href="#generator">Start free</a>
				</Button>
			</header>

			<main id="top">
				<section className="px-5 pb-16 pt-8 sm:px-8 lg:pb-24 lg:pt-12">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 lg:gap-10">
						<div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)] lg:items-end">
							<div className="max-w-3xl space-y-4">
								<Badge
									variant="outline"
									className="border-primary/20 bg-background/70 text-muted-foreground"
								>
									Static wa.me builder
								</Badge>
								<h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
									Build a WhatsApp chat link buyers can use in one tap.
								</h1>
								<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
									Add your number, shape the opening message, and export the same share-ready
									wa.me link as copy, QR, or a WhatsApp launch.
								</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
								<Button size="lg" onClick={focusPhoneNumber}>
									Build my link
								</Button>
								<Button asChild variant="outline" size="lg">
									<a href="#how-it-works">See how it works</a>
								</Button>
							</div>
						</div>

						<form id="generator" ref={formRef} className="scroll-mt-8 w-full" onSubmit={buildLink}>
							<div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-card/95 shadow-[0_24px_80px_-36px_color-mix(in_oklch,_var(--primary)_32%,_transparent)] backdrop-blur-sm">
								<div className="border-b border-border/70 px-5 py-5 sm:px-7 lg:px-8">
									<div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
										<div className="space-y-2">
											<div>
												<h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
													WhatsApp link generator
												</h2>
												<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
													Keep the essentials in view, then pull from presets or recent
													builds when you need a faster starting point.
												</p>
											</div>
										</div>
									</div>
								</div>

								<div className="grid gap-0 lg:grid-cols-[minmax(0,1.15fr)_24rem] xl:grid-cols-[minmax(0,1.2fr)_27rem]">
									<div className="min-w-0 border-b border-border/70 px-5 py-5 sm:px-7 lg:border-b-0 lg:border-r lg:px-8 lg:py-7">
										<div className="space-y-6">
											{error ? (
												<Alert variant="destructive">
													<AlertTitle>Missing details</AlertTitle>
													<AlertDescription>{error}</AlertDescription>
												</Alert>
											) : null}

											<div className="flex flex-col gap-5">
												<div className="flex min-w-0 flex-col gap-2">
													<Label htmlFor="phone">WhatsApp phone number</Label>
													<PhoneInput
														ref={phoneInputRef}
														id="phone"
														name="phone"
														defaultCountry="IN"
														value={phone}
														onChange={setPhone}
														placeholder="+91 98765 43210"
														aria-invalid={isPhoneMissing}
													/>
													<p className="text-sm leading-6 text-muted-foreground">
														Use the number buyers should reach directly in WhatsApp.
													</p>
												</div>

												<div className="flex min-w-0 flex-col gap-2">
													<Label htmlFor="custom-message">Message</Label>
													<Textarea
														ref={messageRef}
														id="custom-message"
														name="customMessage"
														value={customMessage}
														onChange={(event) => setCustomMessage(event.target.value)}
														placeholder="Hi, I want to place an order from your catalog."
														aria-invalid={isMessageMissing}
														className="min-h-36 resize-y"
													/>
													<div className="flex justify-end">
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
															<PopoverContent
																align="end"
																className="w-[min(22rem,calc(100vw-2rem))] p-0"
															>
																<EmojiPicker
																	width="100%"
																	height={360}
																	previewConfig={{ showPreview: false }}
																	onEmojiClick={insertEmoji}
																/>
															</PopoverContent>
														</Popover>
													</div>
													<p className="text-sm leading-6 text-muted-foreground">
														This becomes the encoded{" "}
														<code className="rounded bg-secondary/60 px-1 py-0.5 text-[0.8rem]">
															text=
														</code>{" "}
														value in your wa.me link.
													</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
												<p className="text-sm leading-6 text-muted-foreground">
													Phone number and message are both required before the link can be
													built.
												</p>
												<Button className="w-full sm:w-auto" type="submit" disabled={isBuilding}>
													{isBuilding ? "Building..." : "Build my link"}
												</Button>
											</div>

											<div className="grid gap-4 border-t border-border/70 pt-5 lg:grid-cols-2">
												<div className="rounded-2xl border border-border/70 bg-card/75">
													<button
														type="button"
														aria-label="Recent messages"
														className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
														aria-expanded={isRecentTrayOpen}
														aria-controls="recent-messages-panel"
														onClick={() => setIsRecentTrayOpen((current) => !current)}
													>
														<div className="min-w-0">
															<p className="font-medium text-foreground">Recent messages</p>
															<p className="text-sm leading-6 text-muted-foreground">
																Last successful drafts, ready to reuse without rebuilding
																automatically.
															</p>
														</div>
														<div className="flex items-center gap-3 text-muted-foreground">
															<span className="rounded-full border border-border/70 px-2 py-1 text-xs">
																{recentMessages.length}
															</span>
															<ChevronDown
																aria-hidden="true"
																className={cn(
																	"size-4 transition-transform",
																	isRecentTrayOpen && "rotate-180",
																)}
															/>
														</div>
													</button>
													<div
														id="recent-messages-panel"
														hidden={!isRecentTrayOpen}
														className="border-t border-border/70 px-4 py-4"
													>
														{recentMessages.length ? (
															<div className="flex flex-wrap gap-2">
																{recentMessages.map((message) => (
																	<Button
																		key={message}
																		type="button"
																		variant="outline"
																		size="sm"
																		className="max-w-full justify-start text-left"
																		aria-label={`Use recent message ${message}`}
																		onClick={() => applyMessageTemplate(message)}
																	>
																		<span className="max-w-full truncate">{message}</span>
																	</Button>
																))}
															</div>
														) : (
															<p className="text-sm leading-6 text-muted-foreground">
																Recent messages appear here after you build a valid link.
															</p>
														)}
													</div>
												</div>

												<div className="rounded-2xl border border-border/70 bg-card/75">
													<button
														type="button"
														aria-label="Presets"
														className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
														aria-expanded={isPresetTrayOpen}
														aria-controls="presets-panel"
														onClick={() => setIsPresetTrayOpen((current) => !current)}
													>
														<div className="min-w-0">
															<p className="font-medium text-foreground">Presets</p>
															<p className="text-sm leading-6 text-muted-foreground">
																Built-in openers plus your saved repeat-use chat starters.
															</p>
														</div>
														<div className="flex items-center gap-3 text-muted-foreground">
															<span className="rounded-full border border-border/70 px-2 py-1 text-xs">
																{BUILT_IN_PRESETS.length + customPresets.length}
															</span>
															<ChevronDown
																aria-hidden="true"
																className={cn(
																	"size-4 transition-transform",
																	isPresetTrayOpen && "rotate-180",
																)}
															/>
														</div>
													</button>
													<div
														id="presets-panel"
														hidden={!isPresetTrayOpen}
														className="border-t border-border/70 px-4 py-4"
													>
														<div className="space-y-5">
															<div className="space-y-2">
																<div className="flex items-center justify-between gap-3">
																	<Label>Built-in presets</Label>
																	<p className="text-xs text-muted-foreground">
																		Apply first, then build
																	</p>
																</div>
																<div className="flex flex-wrap gap-2">
																	{BUILT_IN_PRESETS.map((preset) => (
																		<Button
																			key={preset.label}
																			type="button"
																			variant="outline"
																			size="sm"
																			aria-label={`Use preset ${preset.label}`}
																			onClick={() => applyMessageTemplate(preset.message)}
																		>
																			{preset.label}
																		</Button>
																	))}
																</div>
															</div>

															<Separator />

															<div className="space-y-4">
																<div className="flex items-center justify-between gap-3">
																	<Label>Custom presets</Label>
																	<p className="text-xs text-muted-foreground">
																		{customPresets.length}/{MAX_CUSTOM_PRESETS} saved
																	</p>
																</div>

																<div className="grid gap-3 md:grid-cols-2">
																	<div className="flex flex-col gap-2">
																		<Label htmlFor="preset-label">Preset label</Label>
																		<Input
																			ref={presetLabelRef}
																			id="preset-label"
																			value={presetLabel}
																			onChange={(event) => setPresetLabel(event.target.value)}
																			placeholder="Catalog follow-up"
																		/>
																	</div>
																	<div className="flex flex-col gap-2">
																		<Label htmlFor="preset-message">Preset message</Label>
																		<Input
																			id="preset-message"
																			value={presetMessage}
																			onChange={(event) => setPresetMessage(event.target.value)}
																			placeholder="Hi, can you share the latest catalog?"
																		/>
																	</div>
																</div>

																<div className="flex flex-wrap gap-2">
																	<Button
																		type="button"
																		variant="secondary"
																		disabled={!isPresetFormValid || isCustomPresetLimitReached}
																		onClick={savePreset}
																	>
																		{editingPresetId ? "Update preset" : "Add preset"}
																	</Button>
																	{editingPresetId ? (
																		<Button type="button" variant="outline" onClick={resetPresetForm}>
																			Cancel edit
																		</Button>
																	) : null}
																</div>

																{isCustomPresetLimitReached ? (
																	<p className="text-sm text-muted-foreground">
																		You can save up to {MAX_CUSTOM_PRESETS} custom presets.
																	</p>
																) : null}

																{customPresets.length ? (
																	<div className="grid gap-3">
																		{customPresets.map((preset) => (
																			<div
																				key={preset.id}
																				className="flex flex-col gap-3 rounded-xl border bg-background p-3 sm:flex-row sm:items-start sm:justify-between"
																			>
																				<div className="min-w-0 space-y-1">
																					<p className="font-medium text-foreground">
																						{preset.label}
																					</p>
																					<p className="text-sm leading-6 text-muted-foreground">
																						{preset.message}
																					</p>
																				</div>
																				<div className="flex flex-wrap gap-2">
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						aria-label={`Use preset ${preset.label}`}
																						onClick={() => applyMessageTemplate(preset.message)}
																					>
																						Use
																					</Button>
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						aria-label={`Edit preset ${preset.label}`}
																						onClick={() => startEditingPreset(preset)}
																					>
																						Edit
																					</Button>
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						aria-label={`Delete preset ${preset.label}`}
																						onClick={() => removePreset(preset.id)}
																					>
																						Delete
																					</Button>
																				</div>
																			</div>
																		))}
																	</div>
																) : (
																	<p className="text-sm text-muted-foreground">
																		Save your own repeat-use chat starters here.
																	</p>
																)}
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>

									<div className="min-w-0 bg-secondary/20 px-5 py-5 sm:px-7 lg:px-8 lg:py-7">
										<div className="flex h-full flex-col gap-5 lg:sticky lg:top-24">
											<div className="space-y-1">
												<p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
													Results
												</p>
												<h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground">
													Ready to share
												</h3>
												<p className="text-sm leading-6 text-muted-foreground">
													Copy the link, open it in WhatsApp, or export the matching QR code.
												</p>
											</div>

											<div className="space-y-2">
												<Label htmlFor="generated-link">Generated link</Label>
												<Input
													id="generated-link"
													readOnly
													value={generatedLink}
													placeholder="Build a link to see the wa.me URL"
												/>
											</div>

											<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
												<Button
													type="button"
													variant="secondary"
													disabled={!generatedLink}
													onClick={copyLink}
												>
													{copyStatus}
												</Button>
												<Button variant="outline" asChild>
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
													type="button"
													variant="outline"
													disabled={!qrCodeUrl}
													onClick={downloadQrCode}
													className="sm:col-span-2 lg:col-span-1 xl:col-span-2"
												>
													Download QR
												</Button>
											</div>

											<div className="overflow-hidden rounded-2xl border border-border/80 bg-background/90">
												<div className="border-b border-border/70 px-4 py-3">
													<Badge variant="outline">Share-ready QR</Badge>
												</div>
												<div className="flex min-h-72 flex-col items-center justify-center gap-4 px-4 py-5">
													{generatedLink ? (
														<>
															<div className="aspect-square w-full max-w-[14rem] rounded-xl border bg-card p-4 shadow-sm">
																<img
																	src={qrCodeUrl}
																	alt="QR code for the generated WhatsApp link"
																	className="size-full"
																/>
															</div>
															<p className="max-w-xs text-center text-sm leading-6 text-muted-foreground">
																Download this PNG for cards, packaging, posters, or in-store
																prompts.
															</p>
														</>
													) : (
														<p className="max-w-xs text-center text-sm leading-6 text-muted-foreground">
															Build a link first to preview the QR code that opens the same
															WhatsApp chat.
														</p>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>

							</div>
						</form>
					</div>
				</section>

				<section id="how-it-works" className="scroll-mt-8 border-y bg-card/70">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:py-20">
						<div className="flex max-w-2xl flex-col gap-3">
							<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
								How to create a WhatsApp link
							</h2>
							<p className="text-base leading-7 text-muted-foreground">
								Link Basket creates one static WhatsApp link you can share anywhere buyers
								already find you. The generated URL uses WhatsApp&apos;s wa.me format and
								does not require a backend.
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

				<section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-20">
					<div className="flex min-w-0 flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
							What is a WhatsApp link?
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							A WhatsApp link is a URL that opens a chat with a specific phone number.
							When the link includes a text query, WhatsApp also fills the message box
							with your chosen message so the buyer can review it and send.
						</p>
					</div>
					<Card className="min-w-0">
						<CardHeader>
							<CardTitle>Example wa.me output</CardTitle>
							<CardDescription>
								Link Basket keeps the generated link simple and portable.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<code className="block max-w-full break-all rounded-md border bg-secondary/60 p-4 text-sm text-secondary-foreground">
								https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20order%20from%20your%20catalog
							</code>
						</CardContent>
					</Card>
				</section>

				<section className="border-y bg-card/70">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:py-20">
						<div className="flex max-w-2xl flex-col gap-3">
							<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
								Where to use your WhatsApp link
							</h2>
							<p className="text-base leading-7 text-muted-foreground">
								Use one generated link across digital and offline touchpoints so every
								buyer starts with the same clear message.
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							<Card>
								<CardHeader>
									<CardTitle>Seller profiles</CardTitle>
									<CardDescription>
										Add your WhatsApp link to Instagram bios, story stickers, marketplace
										profiles, and saved DM replies.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>Catalogs and product posts</CardTitle>
									<CardDescription>
										Point buyers to a chat starter for orders, size questions, availability,
										or delivery details.
									</CardDescription>
								</CardHeader>
							</Card>
							<Card>
								<CardHeader>
									<CardTitle>QR codes and print</CardTitle>
									<CardDescription>
										Download the QR code for flyers, packages, counters, menus, and printed
										material that should open the same chat.
									</CardDescription>
								</CardHeader>
							</Card>
						</div>
					</div>
				</section>

				<section id="faq" className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 lg:py-20">
					<div className="flex max-w-2xl flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
							WhatsApp link questions
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							Short answers for sellers who want a direct chat link without extra setup.
						</p>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						<Card>
							<CardHeader>
								<CardTitle>Do I need the WhatsApp Business API?</CardTitle>
								<CardDescription>
									No. Link Basket only creates a static wa.me link. Buyers open the link in
									WhatsApp and send the message themselves.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>What phone number format should I use?</CardTitle>
								<CardDescription>
									Enter a valid WhatsApp number with the country code. Link Basket removes
									spaces and symbols before building the final digits-only URL.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Can I create a WhatsApp link with emoji?</CardTitle>
								<CardDescription>
									Yes. Add emoji in the message field and Link Basket encodes the text query
									so the generated link stays shareable.
								</CardDescription>
							</CardHeader>
						</Card>
						<Card>
							<CardHeader>
								<CardTitle>Is the QR code based on the same link?</CardTitle>
								<CardDescription>
									Yes. The QR code is generated in your browser from the exact WhatsApp
									link shown in the generated link field.
								</CardDescription>
							</CardHeader>
						</Card>
					</div>
				</section>

				<section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
					<div className="flex max-w-2xl flex-col gap-2">
						<h2 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
							Create a WhatsApp link now
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
