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
import type { Locale, LocaleContent } from "@/lib/i18n";
import { buildWhatsAppLink, getQrDownloadFileName } from "@/lib/linkdrop";
import {
	addRecentMessage,
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

type LinkDropLandingProps = {
	locale: Locale;
	content: LocaleContent["landing"];
};

export default function LinkDropLanding({ locale, content }: LinkDropLandingProps) {
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
	const [copyStatus, setCopyStatus] = useState(content.results.copyIdle);
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
		isPhoneMissing || isMessageMissing ? content.form.error.validation : "";
	const error = buildError || validationError;

	const englishPath = "/";
	const malayPath = "/ms/";

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

		setCopyStatus(content.results.copyIdle);
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
			setBuildError(content.form.error.qr);
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

		setCopyStatus(content.results.copyDone);
		if (copyStatusTimeoutRef.current) {
			window.clearTimeout(copyStatusTimeoutRef.current);
		}
		copyStatusTimeoutRef.current = window.setTimeout(() => {
			setCopyStatus(content.results.copyIdle);
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
					{content.brandName}
				</a>
				<nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
					<a className="transition-colors hover:text-foreground" href="#generator">
						{content.nav.generator}
					</a>
					<a className="transition-colors hover:text-foreground" href="#how-it-works">
						{content.nav.howItWorks}
					</a>
					<a className="transition-colors hover:text-foreground" href="#faq">
						{content.nav.faq}
					</a>
				</nav>
				<div className="flex items-center gap-2">
					<div
						className="hidden items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1 text-xs font-medium text-muted-foreground sm:flex"
						aria-label={content.languageSwitcher.label}
					>
						<a
							href={englishPath}
							className={cn(
								"rounded-full px-3 py-1 transition-colors",
								locale === "en" ? "bg-foreground text-background" : "hover:text-foreground",
							)}
							aria-current={locale === "en" ? "page" : undefined}
						>
							{content.languageSwitcher.english}
						</a>
						<a
							href={malayPath}
							className={cn(
								"rounded-full px-3 py-1 transition-colors",
								locale === "ms" ? "bg-foreground text-background" : "hover:text-foreground",
							)}
							aria-current={locale === "ms" ? "page" : undefined}
						>
							{content.languageSwitcher.malay}
						</a>
					</div>
					<Button asChild size="sm">
						<a href="#generator">{content.hero.finalCta}</a>
					</Button>
				</div>
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
									{content.hero.badge}
								</Badge>
								<h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
									{content.hero.title}
								</h1>
								<p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
									{content.hero.description}
								</p>
							</div>
							<div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
								<Button size="lg" onClick={focusPhoneNumber}>
									{content.hero.primaryCta}
								</Button>
								<Button asChild variant="outline" size="lg">
									<a href="#how-it-works">{content.hero.secondaryCta}</a>
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
													{content.form.title}
												</h2>
												<p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
													{content.form.description}
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
													<AlertTitle>{content.form.error.title}</AlertTitle>
													<AlertDescription>{error}</AlertDescription>
												</Alert>
											) : null}

											<div className="flex flex-col gap-5">
												<div className="flex min-w-0 flex-col gap-2">
													<Label htmlFor="phone">{content.form.phone.label}</Label>
													<PhoneInput
														ref={phoneInputRef}
														id="phone"
														name="phone"
														defaultCountry={content.form.phone.defaultCountry}
														value={phone}
														onChange={setPhone}
														placeholder={content.form.phone.placeholder}
														aria-invalid={isPhoneMissing}
													/>
													<p className="text-sm leading-6 text-muted-foreground">
														{content.form.phone.hint}
													</p>
												</div>

												<div className="flex min-w-0 flex-col gap-2">
													<Label htmlFor="custom-message">{content.form.message.label}</Label>
													<Textarea
														ref={messageRef}
														id="custom-message"
														name="customMessage"
														value={customMessage}
														onChange={(event) => setCustomMessage(event.target.value)}
														placeholder={content.form.message.placeholder}
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
																	aria-label={content.form.emoji.button}
																	title={content.form.emoji.button}
																>
																	<SmilePlus aria-hidden="true" />
																	{content.form.emoji.button}
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
														{content.form.message.hint.split("text=")[0]}
														{" "}
														<code className="rounded bg-secondary/60 px-1 py-0.5 text-[0.8rem]">
															text=
														</code>{" "}
														{content.form.message.hint.split("text=")[1]}
													</p>
												</div>
											</div>

											<div className="flex flex-col gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between">
												<p className="text-sm leading-6 text-muted-foreground">
													{content.form.submit.requirements}
												</p>
												<Button className="w-full sm:w-auto" type="submit" disabled={isBuilding}>
													{isBuilding ? content.form.submit.loading : content.form.submit.idle}
												</Button>
											</div>

											<div className="grid gap-4 border-t border-border/70 pt-5 lg:grid-cols-2">
												<div className="rounded-2xl border border-border/70 bg-card/75">
													<button
														type="button"
														aria-label={content.form.recents.label}
														className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
														aria-expanded={isRecentTrayOpen}
														aria-controls="recent-messages-panel"
														onClick={() => setIsRecentTrayOpen((current) => !current)}
													>
														<div className="min-w-0">
															<p className="font-medium text-foreground">
																{content.form.recents.label}
															</p>
															<p className="text-sm leading-6 text-muted-foreground">
																{content.form.recents.description}
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
																		aria-label={`${content.form.recents.usePrefix} ${message}`}
																		onClick={() => applyMessageTemplate(message)}
																	>
																		<span className="max-w-full truncate">{message}</span>
																	</Button>
																))}
															</div>
														) : (
															<p className="text-sm leading-6 text-muted-foreground">
																{content.form.recents.empty}
															</p>
														)}
													</div>
												</div>

												<div className="rounded-2xl border border-border/70 bg-card/75">
													<button
														type="button"
														aria-label={content.form.presets.label}
														className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
														aria-expanded={isPresetTrayOpen}
														aria-controls="presets-panel"
														onClick={() => setIsPresetTrayOpen((current) => !current)}
													>
														<div className="min-w-0">
															<p className="font-medium text-foreground">{content.form.presets.label}</p>
															<p className="text-sm leading-6 text-muted-foreground">
																{content.form.presets.description}
															</p>
														</div>
														<div className="flex items-center gap-3 text-muted-foreground">
															<span className="rounded-full border border-border/70 px-2 py-1 text-xs">
																{content.form.presets.builtIn.length + customPresets.length}
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
																	<Label>{content.form.presets.builtInLabel}</Label>
																	<p className="text-xs text-muted-foreground">
																		{content.form.presets.builtInHint}
																	</p>
																</div>
																<div className="flex flex-wrap gap-2">
																	{content.form.presets.builtIn.map((preset) => (
																		<Button
																			key={preset.label}
																			type="button"
																			variant="outline"
																			size="sm"
																			aria-label={`${content.form.presets.usePrefix} ${preset.label}`}
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
																	<Label>{content.form.presets.customLabel}</Label>
																	<p className="text-xs text-muted-foreground">
																		{customPresets.length}/{MAX_CUSTOM_PRESETS} {content.form.presets.savedSuffix}
																	</p>
																</div>

																<div className="grid gap-3 md:grid-cols-2">
																	<div className="flex flex-col gap-2">
																		<Label htmlFor="preset-label">{content.form.presets.labelField}</Label>
																		<Input
																			ref={presetLabelRef}
																			id="preset-label"
																			value={presetLabel}
																			onChange={(event) => setPresetLabel(event.target.value)}
																			placeholder={content.form.presets.labelPlaceholder}
																		/>
																	</div>
																	<div className="flex flex-col gap-2">
																		<Label htmlFor="preset-message">{content.form.presets.messageField}</Label>
																		<Input
																			id="preset-message"
																			value={presetMessage}
																			onChange={(event) => setPresetMessage(event.target.value)}
																			placeholder={content.form.presets.messagePlaceholder}
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
																		{editingPresetId
																			? content.form.presets.updateButton
																			: content.form.presets.addButton}
																	</Button>
																	{editingPresetId ? (
																		<Button type="button" variant="outline" onClick={resetPresetForm}>
																			{content.form.presets.cancelButton}
																		</Button>
																	) : null}
																</div>

																{isCustomPresetLimitReached ? (
																	<p className="text-sm text-muted-foreground">
																		{content.form.presets.limit}
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
																						aria-label={`${content.form.presets.usePrefix} ${preset.label}`}
																						onClick={() => applyMessageTemplate(preset.message)}
																					>
																						{content.form.presets.useButton}
																					</Button>
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						aria-label={`${content.form.presets.editPrefix} ${preset.label}`}
																						onClick={() => startEditingPreset(preset)}
																					>
																						{content.form.presets.editButton}
																					</Button>
																					<Button
																						type="button"
																						size="sm"
																						variant="outline"
																						aria-label={`${content.form.presets.deletePrefix} ${preset.label}`}
																						onClick={() => removePreset(preset.id)}
																					>
																						{content.form.presets.deleteButton}
																					</Button>
																				</div>
																			</div>
																		))}
																	</div>
																) : (
																	<p className="text-sm text-muted-foreground">
																		{content.form.presets.empty}
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
														{content.results.eyebrow}
													</p>
													<h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground">
														{content.results.title}
													</h3>
													<p className="text-sm leading-6 text-muted-foreground">
														{content.results.description}
													</p>
												</div>

											<div className="space-y-2">
												<Label htmlFor="generated-link">{content.results.generatedLinkLabel}</Label>
												<Input
													id="generated-link"
													readOnly
													value={generatedLink}
													placeholder={content.results.generatedLinkPlaceholder}
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
														{content.results.open}
													</a>
												</Button>
												<Button
													type="button"
													variant="outline"
													disabled={!qrCodeUrl}
													onClick={downloadQrCode}
													className="sm:col-span-2 lg:col-span-1 xl:col-span-2"
												>
													{content.results.download}
												</Button>
											</div>

											<div className="overflow-hidden rounded-2xl border border-border/80 bg-background/90">
												<div className="border-b border-border/70 px-4 py-3">
													<Badge variant="outline">{content.results.qrBadge}</Badge>
												</div>
												<div className="flex min-h-72 flex-col items-center justify-center gap-4 px-4 py-5">
													{generatedLink ? (
														<>
															<div className="aspect-square w-full max-w-[14rem] rounded-xl border bg-card p-4 shadow-sm">
																<img
																	src={qrCodeUrl}
																	alt={content.results.qrAlt}
																	className="size-full"
																/>
															</div>
															<p className="max-w-xs text-center text-sm leading-6 text-muted-foreground">
																{content.results.qrReady}
															</p>
														</>
													) : (
														<p className="max-w-xs text-center text-sm leading-6 text-muted-foreground">
															{content.results.qrEmpty}
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
								{content.howItWorks.title}
							</h2>
							<p className="text-base leading-7 text-muted-foreground">
								{content.howItWorks.description}
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-3">
							{content.howItWorks.steps.map((step) => (
								<Card key={step.badge}>
									<CardHeader>
										<Badge variant="outline">{step.badge}</Badge>
										<CardTitle>{step.title}</CardTitle>
										<CardDescription>{step.description}</CardDescription>
									</CardHeader>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-20">
					<div className="flex min-w-0 flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
							{content.explainer.title}
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							{content.explainer.description}
						</p>
					</div>
					<Card className="min-w-0">
						<CardHeader>
							<CardTitle>{content.explainer.exampleTitle}</CardTitle>
							<CardDescription>
								{content.explainer.exampleDescription}
							</CardDescription>
						</CardHeader>
						<CardContent>
							<code className="block max-w-full break-all rounded-md border bg-secondary/60 p-4 text-sm text-secondary-foreground">
								{content.explainer.exampleLink}
							</code>
						</CardContent>
					</Card>
				</section>

				<section className="border-y bg-card/70">
					<div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-16 sm:px-8 lg:py-20">
						<div className="flex max-w-2xl flex-col gap-3">
							<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
								{content.useCases.title}
							</h2>
							<p className="text-base leading-7 text-muted-foreground">
								{content.useCases.description}
							</p>
						</div>
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{content.useCases.cards.map((card) => (
								<Card key={card.title}>
									<CardHeader>
										<CardTitle>{card.title}</CardTitle>
										<CardDescription>{card.description}</CardDescription>
									</CardHeader>
								</Card>
							))}
						</div>
					</div>
				</section>

				<section id="faq" className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-16 sm:px-8 lg:py-20">
					<div className="flex max-w-2xl flex-col gap-3">
						<h2 className="text-3xl font-semibold tracking-normal text-foreground sm:text-4xl">
							{content.faq.title}
						</h2>
						<p className="text-base leading-7 text-muted-foreground">
							{content.faq.description}
						</p>
					</div>
					<div className="grid gap-4 md:grid-cols-2">
						{content.faq.items.map((item) => (
							<Card key={item.question}>
								<CardHeader>
									<CardTitle>{item.question}</CardTitle>
									<CardDescription>{item.answer}</CardDescription>
								</CardHeader>
							</Card>
						))}
					</div>
				</section>

				<section className="mx-auto flex w-full max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center">
					<div className="flex max-w-2xl flex-col gap-2">
						<h2 className="text-2xl font-semibold tracking-normal text-foreground sm:text-3xl">
							{content.finalCta.title}
						</h2>
						<p className="text-muted-foreground">{content.finalCta.description}</p>
					</div>
					<Button asChild size="lg">
						<a href="#generator">{content.finalCta.button}</a>
					</Button>
				</section>
			</main>
		</div>
	);
}
