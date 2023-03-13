import { DisplayUnits, SemanticNegativeNumberFormats, SemanticPositiveNumberFormats } from "../enum";
import { Visual } from "../visual";

export const GetAutoUnitFormattedNumber = (self: Visual, number: number, isSemanticFormat: boolean): string => {
    let formattedNumber: string;
    const numberSettings = self.numberSettings;
    if (number < 1.0e6) {
        formattedNumber = DecimalSeparator(self, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
        return (
            (isSemanticFormat ? GetSemanticFormattedNumber(self, formattedNumber, number) : formattedNumber) +
            numberSettings.thousands
        );
    } else if (number >= 1.0e6 && number < 1.0e9) {
        formattedNumber = DecimalSeparator(self, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
        return (
            (isSemanticFormat ? GetSemanticFormattedNumber(self, formattedNumber, number) : formattedNumber) +
            numberSettings.million
        );
    } else if (number >= 1.0e9 && number < 1.0e12) {
        formattedNumber = DecimalSeparator(self, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
        return (
            (isSemanticFormat ? GetSemanticFormattedNumber(self, formattedNumber, number) : formattedNumber) +
            numberSettings.billion
        );
    } else if (number >= 1.0e12) {
        formattedNumber = DecimalSeparator(self, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
        return (
            (isSemanticFormat ? GetSemanticFormattedNumber(self, formattedNumber, number) : formattedNumber) +
            numberSettings.trillion
        );
    }

    return number.toString();
}

export const ThousandsSeparator = (self: Visual, number: number): string => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, self.numberSettings.thousandsSeparator);
}

export const DecimalSeparator = (self: Visual, number: number): string => {
    const decimals = (number - Math.floor(number)).toFixed(self.numberSettings.decimalPlaces);
    const fNumber =
        (number + "").split(".")[0] +
        (+decimals > 0 ? self.numberSettings.decimalSeparator + (decimals + "").split(".")[1] : "");
    // return self.thousandsSeparator(+fNumber);
    return fNumber;
}

export const GetSemanticFormattedNumber = (self: Visual, number: string, originalNumber: number): string | number => {
    const numberSettings = self.numberSettings;
    let formattedNumber: any;
    if (numberSettings.isSemanticFormattingEnabled) {
        if (parseFloat(number) >= 0) {
            switch (numberSettings.positiveNumberFormat) {
                case SemanticPositiveNumberFormats.X:
                    formattedNumber = number;
                    break;
                case SemanticPositiveNumberFormats.PlusX:
                    formattedNumber = "+" + number;
                    break;
                case SemanticPositiveNumberFormats.XPlus:
                    formattedNumber = number + "+";
                    break;
            }
        } else {
            const negativeNumber = numberSettings.displayUnits === DisplayUnits.None ? originalNumber : parseFloat(number);
            const absNumber =
                numberSettings.displayUnits === DisplayUnits.None
                    ? ThousandsSeparator(self, parseFloat(Math.abs(negativeNumber).toFixed(numberSettings.decimalPlaces)))
                    : Math.abs(negativeNumber);
            switch (numberSettings.negativeNumberFormat) {
                case SemanticNegativeNumberFormats.X:
                    formattedNumber = absNumber + "";
                    break;
                case SemanticNegativeNumberFormats.MinusX:
                    formattedNumber = "-" + absNumber;
                    break;
                case SemanticNegativeNumberFormats.XMinus:
                    formattedNumber = absNumber + "-";
                    break;
                case SemanticNegativeNumberFormats.XInBrackets:
                    formattedNumber = "(" + absNumber + ")";
                    break;
            }
        }
    } else {
        formattedNumber = number;
    }

    return formattedNumber;
}

export const GetFormattedNumber = (self: Visual, number: number, isSematicFormat: boolean): string => {
    const numberSettings = self.numberSettings;

    if (!numberSettings.show) {
        return number + "";
    }

    let formattedNumber: string | number = "0";
    switch (numberSettings.displayUnits) {
        case DisplayUnits.Auto: {
            if (self.chartSettings.isPercentageStackedBar) {
                formattedNumber = number.toFixed(0) + "%";
            } else {
                formattedNumber = GetAutoUnitFormattedNumber(self, number, isSematicFormat);
            }
            break;
        }
        case DisplayUnits.None: {
            formattedNumber = ThousandsSeparator(self, parseFloat(number.toFixed(numberSettings.decimalPlaces)));
            break;
        }
        case DisplayUnits.Thousands: {
            formattedNumber = DecimalSeparator(self, +(number / 1.0e3).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Millions: {
            formattedNumber = DecimalSeparator(self, +(number / 1.0e6).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Billions: {
            formattedNumber = DecimalSeparator(self, +(number / 1.0e9).toFixed(numberSettings.decimalPlaces));
            break;
        }
        case DisplayUnits.Trillions: {
            formattedNumber = DecimalSeparator(self, +(number / 1.0e12).toFixed(numberSettings.decimalPlaces));
            break;
        }
        default: {
            formattedNumber = GetAutoUnitFormattedNumber(self, number, isSematicFormat);
        }
    }

    if (isSematicFormat && numberSettings.displayUnits !== DisplayUnits.Auto) {
        formattedNumber = GetSemanticFormattedNumber(self, formattedNumber, number);
    }

    switch (numberSettings.displayUnits) {
        case DisplayUnits.Auto: {
            if (self.chartSettings.isPercentageStackedBar) {
                formattedNumber = formattedNumber;
            } else {
                formattedNumber = formattedNumber;
            }
            break;
        }
        case DisplayUnits.None: {
            formattedNumber = formattedNumber;
            break;
        }
        case DisplayUnits.Thousands: {
            formattedNumber = formattedNumber + numberSettings.thousands;
            break;
        }
        case DisplayUnits.Millions: {
            formattedNumber = formattedNumber + numberSettings.million;
            break;
        }
        case DisplayUnits.Billions: {
            formattedNumber = formattedNumber + numberSettings.billion;
            break;
        }
        case DisplayUnits.Trillions: {
            formattedNumber = formattedNumber + numberSettings.trillion;
            break;
        }
        default: {
            formattedNumber = formattedNumber;
        }
    }

    return numberSettings.prefix + " " + formattedNumber + " " + numberSettings.suffix;
}
