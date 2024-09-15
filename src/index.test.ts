import { suite } from "uvu";
import * as assert from "uvu/assert";

import { styles } from "./index.js";

const test = suite("styles");

test("should add classes from styles variants", () => {
	const variants = styles({
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
	});

	assert.is(variants({}), "");
	assert.is(variants({ size: "md" }), "text-base");
	assert.is(variants({ isDisabled: true }), "opacity-50 pointer-events-none");
	assert.is(variants({ size: "lg", isDisabled: true }), "text-lg opacity-50 pointer-events-none");
});

test("should combine base classes with classes from styles variants", () => {
	const variants = styles({
		base: "text-black bg-white",
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
	});

	assert.is(variants({}), "text-black bg-white");
	assert.is(variants({ size: "md" }), "text-black bg-white text-base");
	assert.is(variants({ isDisabled: true }), "text-black bg-white opacity-50 pointer-events-none");
	assert.is(
		variants({ size: "lg", isDisabled: true }),
		"text-black bg-white text-lg opacity-50 pointer-events-none",
	);
});

test("should use default styles variants", () => {
	const variants = styles({
		base: "text-black bg-white",
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
		defaults: {
			size: "sm",
		},
	});

	assert.is(variants({}), "text-black bg-white text-sm");
	assert.is(variants({ size: "md" }), "text-black bg-white text-base");
	assert.is(
		variants({ isDisabled: true }),
		"text-black bg-white text-sm opacity-50 pointer-events-none",
	);
	assert.is(
		variants({ size: "lg", isDisabled: true }),
		"text-black bg-white text-lg opacity-50 pointer-events-none",
	);
});

test("should handle boolean defaults and treat `false` and `undefined` differently", () => {
	const variants = styles({
		variants: {
			isSubtle: {
				false: "bg-white",
				true: "bg-neutral-100",
			},
			isFocusVisible: {
				false: "border",
				true: "border-2 outline-2 outline-black",
			},
			isHovered: {
				false: "scale-100",
				true: "scale-105",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
		defaults: {
			isSubtle: true,
			isFocusVisible: false,
			isDisabled: false,
		},
	});

	assert.is(variants({}), "bg-neutral-100 border");
	assert.is(variants({ isHovered: false }), "bg-neutral-100 border scale-100");
});

test("should add classes from variant combinations", () => {
	const variants = styles({
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			color: {
				pink: "text-pink-600",
				purple: "text-purple-600",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
		combinations: [
			[{ color: "pink", size: "lg" }, "bg-pink-50"],
			[{ color: "purple", isDisabled: true }, "cursor-not-allowed"],
			[{ color: "purple", isDisabled: false }, "cursor-default"],
		],
	});

	assert.is(variants({ color: "purple" }), "text-purple-600");
	assert.is(variants({ color: "pink", size: "lg" }), "text-lg text-pink-600 bg-pink-50");
	assert.is(
		variants({ color: "purple", isDisabled: true }),
		"text-purple-600 opacity-50 pointer-events-none cursor-not-allowed",
	);
	assert.is(variants({ color: "purple", isDisabled: false }), "text-purple-600 cursor-default");
});

test("should use defaults in variant combinations", () => {
	const variants = styles({
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			color: {
				pink: "text-pink-600",
				purple: "text-purple-600",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
		defaults: {
			size: "md",
			isDisabled: false,
		},
		combinations: [
			[{ color: "pink", size: "lg" }, "bg-pink-50"],
			[{ color: "purple", isDisabled: true }, "cursor-not-allowed"],
			[{ color: "purple", isDisabled: false }, "cursor-default"],
		],
	});

	assert.is(variants({ color: "purple" }), "text-base text-purple-600 cursor-default");
	assert.is(variants({ color: "pink", size: "lg" }), "text-lg text-pink-600 bg-pink-50");
	assert.is(
		variants({ color: "purple", isDisabled: true }),
		"text-base text-purple-600 opacity-50 pointer-events-none cursor-not-allowed",
	);
	assert.is(
		variants({ color: "purple", isDisabled: false }),
		"text-base text-purple-600 cursor-default",
	);
});

test("should extend variants", () => {
	const focusIndicator = styles({
		base: "outline-offset-2",
		variants: {
			isFocusVisible: {
				false: "outline-0",
				true: "outline-2",
			},
		},
	});

	const variants = styles({
		extend: [focusIndicator],
		base: "text-black bg-white",
		variants: {
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
			isDisabled: {
				true: "opacity-50 pointer-events-none",
			},
		},
	});

	assert.is(variants({}), "outline-offset-2 text-black bg-white");
	assert.is(variants({ isFocusVisible: false }), "outline-offset-2 outline-0 text-black bg-white");
	assert.is(
		variants({ size: "md", isFocusVisible: true }),
		"outline-offset-2 outline-2 text-black bg-white text-base",
	);
	assert.is(
		variants({ isDisabled: true, isFocusVisible: false }),
		"outline-offset-2 outline-0 text-black bg-white opacity-50 pointer-events-none",
	);
	assert.is(
		variants({ size: "lg", isDisabled: true, isFocusVisible: true }),
		"outline-offset-2 outline-2 text-black bg-white text-lg opacity-50 pointer-events-none",
	);
});

test.run();
