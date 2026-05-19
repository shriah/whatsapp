// @vitest-environment jsdom

import {
	addRecentMessage,
	createCustomPreset,
	defaultPersistedLinkDropState,
	deleteCustomPreset,
	loadPersistedLinkDropState,
	savePersistedLinkDropState,
	updateCustomPreset,
	type CustomPreset,
} from "./linkdrop-storage";
import { beforeEach, describe, expect, it, vi } from "vitest";

function createStorageMock() {
	const storage = new Map<string, string>();

	return {
		clear() {
			storage.clear();
		},
		getItem(key: string) {
			return storage.get(key) ?? null;
		},
		key(index: number) {
			return [...storage.keys()][index] ?? null;
		},
		removeItem(key: string) {
			storage.delete(key);
		},
		setItem(key: string, value: string) {
			storage.set(key, value);
		},
		get length() {
			return storage.size;
		},
	};
}

describe("linkdrop storage", () => {
	beforeEach(() => {
		Object.defineProperty(window, "localStorage", {
			value: createStorageMock(),
			configurable: true,
		});
	});

	it("loads defaults when storage is empty", () => {
		expect(loadPersistedLinkDropState()).toEqual(defaultPersistedLinkDropState);
	});

	it("loads defaults when storage is invalid", () => {
		window.localStorage.setItem("link-basket-generator:v1", "{nope");

		expect(loadPersistedLinkDropState()).toEqual(defaultPersistedLinkDropState);
	});

	it("loads defaults when storage version does not match", () => {
		window.localStorage.setItem(
			"link-basket-generator:v1",
			JSON.stringify({
				version: 2,
				phone: "+919876543210",
				draftMessage: "Hi",
				recentMessages: ["Hi"],
				customPresets: [],
			}),
		);

		expect(loadPersistedLinkDropState()).toEqual(defaultPersistedLinkDropState);
	});

	it("saves and restores persisted inputs", () => {
		const state = {
			version: 1 as const,
			phone: "+919876543210",
			draftMessage: "Need a restock update",
			recentMessages: ["Need a restock update"],
			customPresets: [
				{
					id: "preset-1",
					label: "Restock",
					message: "Need a restock update",
				},
			],
		};

		savePersistedLinkDropState(state);

		expect(loadPersistedLinkDropState()).toEqual(state);
	});

	it("deduplicates recent messages and caps the list at five items", () => {
		const recentMessages = [
			"one",
			"two",
			"three",
			"four",
			"five",
		];

		expect(addRecentMessage(recentMessages, "three")).toEqual([
			"three",
			"one",
			"two",
			"four",
			"five",
		]);

		expect(addRecentMessage(recentMessages, "six")).toEqual([
			"six",
			"one",
			"two",
			"three",
			"four",
		]);
	});

	it("creates, updates, and deletes custom presets", () => {
		const createId = vi.fn(() => "preset-2");
		const startingPresets: CustomPreset[] = [
			{
				id: "preset-1",
				label: "Order inquiry",
				message: "Hi, I want to place an order.",
			},
		];

		const created = createCustomPreset(
			startingPresets,
			{
				label: "Catalog request",
				message: "Please share your latest catalog.",
			},
			createId,
		);

		expect(created).toEqual([
			{
				id: "preset-1",
				label: "Order inquiry",
				message: "Hi, I want to place an order.",
			},
			{
				id: "preset-2",
				label: "Catalog request",
				message: "Please share your latest catalog.",
			},
		]);

		expect(
			updateCustomPreset(created, {
				id: "preset-2",
				label: "Latest catalog",
				message: "Please share the latest catalog and prices.",
			}),
		).toEqual([
			{
				id: "preset-1",
				label: "Order inquiry",
				message: "Hi, I want to place an order.",
			},
			{
				id: "preset-2",
				label: "Latest catalog",
				message: "Please share the latest catalog and prices.",
			},
		]);

		expect(deleteCustomPreset(created, "preset-1")).toEqual([
			{
				id: "preset-2",
				label: "Catalog request",
				message: "Please share your latest catalog.",
			},
		]);
	});
});
