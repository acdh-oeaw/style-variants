import { type ClassValue, clsx as cn } from "clsx";

export { cn };

type ClassNameProps =
	| { class?: ClassValue; className?: never }
	| { class?: never; className?: ClassValue };

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

type NonEmptyArray<T> = [T, ...Array<T>];

type MergeTwo<A, B> = {
	[K in keyof A | keyof B]: K extends keyof A
		? K extends keyof B
			? A[K] | B[K]
			: A[K]
		: K extends keyof B
			? B[K]
			: never;
};

type Merge<T extends Array<object>> = T extends [infer First, ...infer Rest]
	? First extends object
		? Rest extends Array<object>
			? MergeTwo<First, Merge<Rest>>
			: First
		: never
	: // eslint-disable-next-line @typescript-eslint/no-empty-object-type
		{};

type Variants = Record<string, Record<string, ClassValue>>;

type Schema<T extends Variants> = {
	[K in keyof T]?: StringToBoolean<keyof T[K]> | undefined;
};

interface Config<T extends Variants> {
	base?: ClassValue;
	variants: T;
	defaults?: Schema<T>;
	combinations?: Array<[Schema<T>, ClassValue]>;
}

type Func<T extends Variants> = (props: Partial<Schema<T>> & ClassNameProps) => string;

export type GetVariantProps<T extends Func<Variants>> = T extends (
	props: infer P & ClassNameProps,
) => string
	? P
	: never;

export function styles<T extends Variants>({
	base,
	variants,
	defaults = {},
	combinations = [],
}: Config<T>): Func<T> {
	return function ({ class: _class, className: _className, ...props }) {
		const variantNames = Object.keys(variants);

		const classNames: Array<ClassValue> = [base];

		for (const variantName of variantNames) {
			const variantValue = props[variantName] ?? defaults[variantName];
			if (variantValue != null) {
				const className = variants[variantName]![String(variantValue)];
				if (className != null) {
					classNames.push(className);
				}
			}
		}

		for (const [combination, className] of combinations) {
			if (
				Object.keys(combination).every((variantName) => {
					const variantValue = props[variantName] ?? defaults[variantName];
					if (variantValue != null) {
						const combinationValue = combination[variantName];
						return String(combinationValue) === String(variantValue);
					}
					return false;
				})
			) {
				classNames.push(className);
			}
		}

		return cn(...classNames, _class, _className);
	};
}

export function compose<T extends NonEmptyArray<Func<Variants>>>(
	...inputs: T
): (props: Partial<Merge<{ [K in keyof T]: GetVariantProps<T[K]> }>> & ClassNameProps) => string {
	return ({ class: _class, className: _className, ...props }) => {
		const classNames = inputs.map((func) => {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
			return func(props as any);
		});

		return cn(...classNames, _class, _className);
	};
}
