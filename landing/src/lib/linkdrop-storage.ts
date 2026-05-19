export const STORAGE_KEY = "link-basket-generator:v1";
export const MAX_RECENT_MESSAGES = 5;
export const MAX_CUSTOM_PRESETS = 10;

export type CustomPreset = {
	id: string;
	label: string;
	message: string;
};

export type PersistedLinkDropState = {
	version: 1;
	phone: string | undefined;
	draftMessage: string;
	recentMessages: string[];
	customPresets: CustomPreset[];
};

type EditablePresetValues = Pick<CustomPreset, "label" | "message">;

export const defaultPersistedLinkDropState: PersistedLinkDropState = {
	version: 1,
	phone: undefined,
	draftMessage: "",
	recentMessages: [],
	customPresets: [],
};

export function loadPersistedLinkDropState(): PersistedLinkDropState {
	if (typeof window === "undefined") {
		return defaultPersistedLinkDropState;
	}

	try {
		const rawValue = window.localStorage.getItem(STORAGE_KEY);

		if (!rawValue) {
			return defaultPersistedLinkDropState;
		}

		const parsedValue = JSON.parse(rawValue);

		if (!isPersistedState(parsedValue)) {
			return defaultPersistedLinkDropState;
		}

		return {
			version: 1,
			phone: parsedValue.phone,
			draftMessage: parsedValue.draftMessage,
			recentMessages: parsedValue.recentMessages,
			customPresets: parsedValue.customPresets,
		};
	} catch {
		return defaultPersistedLinkDropState;
	}
}

export function savePersistedLinkDropState(state: PersistedLinkDropState) {
	if (typeof window === "undefined") {
		return;
	}

	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignore storage failures so the generator remains usable.
	}
}

export function addRecentMessage(recentMessages: string[], message: string) {
	const normalizedMessage = message.trim();

	if (!normalizedMessage) {
		return recentMessages;
	}

	return [normalizedMessage, ...recentMessages.filter((entry) => entry !== normalizedMessage)].slice(
		0,
		MAX_RECENT_MESSAGES,
	);
}

export function createCustomPreset(
	customPresets: CustomPreset[],
	values: EditablePresetValues,
	createId: () => string,
) {
	const preset = sanitizePresetValues(values);

	if (!preset || customPresets.length >= MAX_CUSTOM_PRESETS) {
		return customPresets;
	}

	return [
		...customPresets,
		{
			id: createId(),
			...preset,
		},
	];
}

export function updateCustomPreset(
	customPresets: CustomPreset[],
	values: CustomPreset,
) {
	const preset = sanitizePresetValues(values);

	if (!preset) {
		return customPresets;
	}

	return customPresets.map((entry) =>
		entry.id === values.id
			? {
					id: values.id,
					...preset,
				}
			: entry,
	);
}

export function deleteCustomPreset(customPresets: CustomPreset[], presetId: string) {
	return customPresets.filter((preset) => preset.id !== presetId);
}

function sanitizePresetValues(values: EditablePresetValues) {
	const label = values.label.trim();
	const message = values.message.trim();

	if (!label || !message) {
		return null;
	}

	return {
		label,
		message,
	};
}

function isPersistedState(value: unknown): value is PersistedLinkDropState {
	if (!value || typeof value !== "object") {
		return false;
	}

	const parsedValue = value as Partial<PersistedLinkDropState>;

	return (
		parsedValue.version === 1 &&
		isOptionalString(parsedValue.phone) &&
		typeof parsedValue.draftMessage === "string" &&
		isStringArray(parsedValue.recentMessages) &&
		parsedValue.recentMessages.every((entry) => entry.trim().length > 0) &&
		parsedValue.recentMessages.length <= MAX_RECENT_MESSAGES &&
		Array.isArray(parsedValue.customPresets) &&
		parsedValue.customPresets.length <= MAX_CUSTOM_PRESETS &&
		parsedValue.customPresets.every(isCustomPreset)
	);
}

function isOptionalString(value: unknown): value is string | undefined {
	return value === undefined || typeof value === "string";
}

function isStringArray(value: unknown): value is string[] {
	return Array.isArray(value) && value.every((entry) => typeof entry === "string");
}

function isCustomPreset(value: unknown): value is CustomPreset {
	if (!value || typeof value !== "object") {
		return false;
	}

	const preset = value as Partial<CustomPreset>;

	return (
		typeof preset.id === "string" &&
		typeof preset.label === "string" &&
		preset.label.trim().length > 0 &&
		typeof preset.message === "string" &&
		preset.message.trim().length > 0
	);
}
