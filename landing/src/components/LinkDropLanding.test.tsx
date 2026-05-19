// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LinkDropLanding from "./LinkDropLanding";
import { BUILT_IN_PRESETS, STORAGE_KEY } from "@/lib/linkdrop-storage";

const toDataURLMock = vi.fn();

vi.mock("emoji-picker-react", () => ({
	default: () => null,
}));

vi.mock("qrcode", () => ({
	default: {
		toDataURL: (...args: unknown[]) => toDataURLMock(...args),
	},
}));

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

async function openTray(user: ReturnType<typeof userEvent.setup>, name: string) {
	const toggle = screen.getByRole("button", { name });

	if (toggle.getAttribute("aria-expanded") !== "true") {
		await user.click(toggle);
	}
}

describe("LinkDropLanding", () => {
	beforeEach(() => {
		toDataURLMock.mockReset();
		toDataURLMock.mockResolvedValue("data:image/png;base64,qr");
		HTMLFormElement.prototype.scrollIntoView = vi.fn();
		Object.defineProperty(window, "localStorage", {
			value: createStorageMock(),
			configurable: true,
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("focuses the phone input when the hero CTA is clicked", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.click(screen.getAllByRole("button", { name: "Build my link" })[0]);

		expect(screen.getByLabelText("WhatsApp phone number")).toHaveFocus();
	});

	it("tabs from the phone input to the message field and then to emoji", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.click(screen.getByLabelText("WhatsApp phone number"));
		await user.tab();
		expect(screen.getByLabelText("Message")).toHaveFocus();

		await user.tab();
		expect(screen.getByRole("button", { name: "Insert emoji" })).toHaveFocus();
	});

	it("builds the wa.me link and enables the follow-up actions", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.type(screen.getByLabelText("WhatsApp phone number"), "9876543210");
		await user.type(screen.getByLabelText("Message"), "Need the latest catalog");
		await user.click(screen.getAllByRole("button", { name: "Build my link" })[1]);

		await waitFor(() => {
			expect(screen.getByLabelText("Generated link")).toHaveValue(
				"https://wa.me/919876543210?text=Need%20the%20latest%20catalog",
			);
		});

		expect(screen.getByRole("button", { name: "Copy link" })).toBeEnabled();
		expect(screen.getByRole("button", { name: "Download QR" })).toBeEnabled();
		expect(screen.getByRole("link", { name: "Open in WhatsApp" })).toHaveAttribute(
			"href",
			"https://wa.me/919876543210?text=Need%20the%20latest%20catalog",
		);
	});

	it("restores saved phone and message on mount without restoring generated output", () => {
		window.localStorage.setItem(
			STORAGE_KEY,
			JSON.stringify({
				version: 1,
				phone: "+919876543210",
				draftMessage: "Need the catalog again",
				recentMessages: ["Need the catalog again"],
				customPresets: [],
			}),
		);

		render(<LinkDropLanding />);

		expect(screen.getByLabelText("WhatsApp phone number")).toHaveValue("+91 98765 43210");
		expect(screen.getByLabelText("Message")).toHaveValue("Need the catalog again");
		expect(screen.getByLabelText("Generated link")).toHaveValue("");
		expect(screen.queryByAltText("QR code for the generated WhatsApp link")).not.toBeInTheDocument();
	});

	it("adds a successfully built message to recents", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.type(screen.getByLabelText("WhatsApp phone number"), "9876543210");
		await user.type(screen.getByLabelText("Message"), "Need the latest catalog");
		await user.click(screen.getAllByRole("button", { name: "Build my link" })[1]);
		await openTray(user, "Recent messages");

		await screen.findByRole("button", { name: "Use recent message Need the latest catalog" });

		expect(screen.getByText("Recent messages")).toBeInTheDocument();
	});

	it("replaces the message from a recent item without auto-building a new link", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		const phoneInput = screen.getByLabelText("WhatsApp phone number");
		const messageInput = screen.getByLabelText("Message");
		const buildButton = screen.getAllByRole("button", { name: "Build my link" })[1];

		await user.type(phoneInput, "9876543210");
		await user.type(messageInput, "First message");
		await user.click(buildButton);

		await waitFor(() => {
			expect(screen.getByLabelText("Generated link")).toHaveValue(
				"https://wa.me/919876543210?text=First%20message",
			);
		});

		await user.clear(messageInput);
		await user.type(messageInput, "Second message");
		await user.click(buildButton);
		await openTray(user, "Recent messages");
		await screen.findByRole("button", { name: "Use recent message Second message" });

		await user.click(screen.getByRole("button", { name: "Use recent message First message" }));

		expect(messageInput).toHaveValue("First message");
		expect(messageInput).toHaveFocus();
		expect(screen.getByLabelText("Generated link")).toHaveValue(
			"https://wa.me/919876543210?text=Second%20message",
		);
	});

	it("applies a built-in preset without auto-building a link", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.type(screen.getByLabelText("WhatsApp phone number"), "9876543210");
		await openTray(user, "Presets");
		await user.click(
			screen.getByRole("button", {
				name: `Use preset ${BUILT_IN_PRESETS[0].label}`,
			}),
		);

		expect(screen.getByLabelText("Message")).toHaveValue(BUILT_IN_PRESETS[0].message);
		expect(screen.getByLabelText("Generated link")).toHaveValue("");
	});

	it("creates, edits, deletes, and applies a custom preset", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await openTray(user, "Presets");
		await user.type(screen.getByLabelText("Preset label"), "Restock");
		await user.type(screen.getByLabelText("Preset message"), "Is this item back in stock?");
		await user.click(screen.getByRole("button", { name: "Add preset" }));

		await user.click(screen.getByRole("button", { name: "Use preset Restock" }));
		expect(screen.getByLabelText("Message")).toHaveValue("Is this item back in stock?");

		await user.click(screen.getByRole("button", { name: "Edit preset Restock" }));
		await user.clear(screen.getByLabelText("Preset label"));
		await user.type(screen.getByLabelText("Preset label"), "Restock follow-up");
		await user.clear(screen.getByLabelText("Preset message"));
		await user.type(screen.getByLabelText("Preset message"), "When will this be back in stock?");
		await user.click(screen.getByRole("button", { name: "Update preset" }));

		await user.click(screen.getByRole("button", { name: "Use preset Restock follow-up" }));
		expect(screen.getByLabelText("Message")).toHaveValue("When will this be back in stock?");

		await user.click(screen.getByRole("button", { name: "Delete preset Restock follow-up" }));
		expect(
			screen.queryByRole("button", { name: "Use preset Restock follow-up" }),
		).not.toBeInTheDocument();
	});

	it("does not add invalid submissions to recents", async () => {
		const user = userEvent.setup();

		render(<LinkDropLanding />);

		await user.type(screen.getByLabelText("Message"), "Missing phone");
		await user.click(screen.getAllByRole("button", { name: "Build my link" })[1]);

		await openTray(user, "Recent messages");
		expect(screen.queryByRole("button", { name: /Use recent message/i })).not.toBeInTheDocument();
	});

	it("clears stale output and shows an error when QR generation fails", async () => {
		const user = userEvent.setup();

		toDataURLMock
			.mockResolvedValueOnce("data:image/png;base64,first")
			.mockRejectedValueOnce(new Error("qr failed"));

		render(<LinkDropLanding />);

		const phoneInput = screen.getByLabelText("WhatsApp phone number");
		const messageInput = screen.getByLabelText("Message");
		const buildButtons = screen.getAllByRole("button", { name: "Build my link" });

		await user.type(phoneInput, "9876543210");
		await user.type(messageInput, "First message");
		await user.click(buildButtons[1]);

		await waitFor(() => {
			expect(screen.getByLabelText("Generated link")).toHaveValue(
				"https://wa.me/919876543210?text=First%20message",
			);
		});

		await user.clear(messageInput);
		await user.type(messageInput, "Second message");
		await user.click(buildButtons[1]);

		await waitFor(() => {
			expect(screen.getByText("We couldn't generate the QR code right now. Try again.")).toBeInTheDocument();
		});

		expect(screen.getByLabelText("Generated link")).toHaveValue("");
		expect(screen.queryByAltText("QR code for the generated WhatsApp link")).not.toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Copy link" })).toBeDisabled();
		expect(screen.getByRole("button", { name: "Download QR" })).toBeDisabled();
	});
});
