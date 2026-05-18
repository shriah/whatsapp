import * as React from "react";
import PhoneInputBase from "react-phone-number-input";
import type { Country, Value } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { cn } from "@/lib/utils";

type PhoneInputProps = Omit<
	React.ComponentProps<typeof PhoneInputBase>,
	"onChange" | "value" | "defaultCountry"
> & {
	defaultCountry?: Country;
	onChange?: (value: Value | undefined) => void;
	value?: Value;
};

function PhoneInput({ className, defaultCountry = "IN", ...props }: PhoneInputProps) {
	return (
		<PhoneInputBase
			defaultCountry={defaultCountry}
			international
			countryCallingCodeEditable={false}
			className={cn(
				"PhoneInput border-input bg-background ring-offset-background flex h-10 w-full min-w-0 items-center rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] md:text-sm",
				"[&_.PhoneInputCountry]:mr-2 [&_.PhoneInputCountrySelect]:cursor-pointer [&_.PhoneInputCountrySelect]:outline-none [&_.PhoneInputInput]:min-w-0 [&_.PhoneInputInput]:flex-1 [&_.PhoneInputInput]:border-0 [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:placeholder:text-muted-foreground",
				"has-[[aria-invalid=true]]:border-destructive has-[[aria-invalid=true]]:ring-destructive/20",
				className,
			)}
			{...props}
		/>
	);
}

export { PhoneInput };
export type { PhoneInputProps };
