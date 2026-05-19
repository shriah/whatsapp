// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import LinkDropLanding from "./LinkDropLanding";

const toDataURLMock = vi.fn();

vi.mock("emoji-picker-react", () => ({
	default: () => null,
}));

vi.mock("qrcode", () => ({
	default: {
		toDataURL: (...args: unknown[]) => toDataURLMock(...args),
	},
}));

describe("LinkDropLanding", () => {
	beforeEach(() => {
		toDataURLMock.mockReset();
		toDataURLMock.mockResolvedValue("data:image/png;base64,qr");
		HTMLFormElement.prototype.scrollIntoView = vi.fn();
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
