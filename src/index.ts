import { type ClassValue, clsx as cn } from "clsx";

type ClassNameProps = { class?: string; className?: never } | { class?: never; className?: string };

type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

type TVariants<TVariantsConfig> = Partial<{
	[TVariantName in keyof TVariantsConfig]: StringToBoolean<keyof TVariantsConfig[TVariantName]>;
}>;

interface StyleVariantsConfig<TVariantsConfig extends Record<string, Record<string, ClassValue>>> {
	extend?: Array<StyleVariantsFunction<TVariantsConfig>>;
	base?: ClassValue;
	variants: TVariantsConfig;
	defaults?: TVariants<TVariantsConfig>;
	combinations?: Array<[TVariants<TVariantsConfig>, ClassValue]>;
}

type StyleVariantsFunction<TVariantsConfig extends Record<string, Record<string, ClassValue>>> = (
	props: TVariants<TVariantsConfig> & ClassNameProps,
) => string;

export function styles<TVariantsConfig extends Record<string, Record<string, ClassValue>>>({
	extend = [],
	base,
	variants,
	defaults = {},
	combinations = [],
}: StyleVariantsConfig<TVariantsConfig>): StyleVariantsFunction<TVariantsConfig> {
	return function (props) {
		const variantNames = Object.keys(variants) as Array<keyof TVariantsConfig>;

		const classNames: Array<ClassValue> = [base];

		for (const fn of extend) {
			const className = fn(props);
			classNames.push(className);
		}

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

		return cn(...classNames, props.class, props.className);
	};
}

export type StyleVariantProps<TVariantsConfig> =
	TVariantsConfig extends StyleVariantsFunction<infer U> ? TVariants<U> : never;
