import { BarType, ColorPaletteType, DataRolesName, RankingFilterType } from "../enum";
import { Visual } from "../visual";
import chroma from "chroma-js";
import { scaleLinear } from "d3";
import { IVisualSubCategoryData } from "../visual-data.model";

export const GetGradientWithinBarColor = (self: Visual): string => {
    const colorsSettings = self.dataColorsSettings;
    if (self.isHorizontalChart) {
        if (colorsSettings.midcolor) {
            return `linear-gradient(to right, ${colorsSettings.fillmin}, ${colorsSettings.fillmid}, ${colorsSettings.fillmax})`;
        } else {
            return `linear-gradient(to right, ${colorsSettings.fillmin}, ${colorsSettings.fillmax})`;
        }
    } else {
        if (colorsSettings.midcolor) {
            return `linear-gradient(${colorsSettings.fillmax}, ${colorsSettings.fillmid}, ${colorsSettings.fillmin})`;
        } else {
            return `linear-gradient(${colorsSettings.fillmax}, ${colorsSettings.fillmin})`;
        }
    }
}

export const SetNormalBarColors = (self: Visual): void => {
    self.categoricalDataPairs.forEach(d => {
        self.subCategoriesColorMap[d.category] = "";
    });

    const colorsSettings = self.dataColorsSettings;
    const keys = self.categoricalDataPairsSortedByHigherValues.map(d => d.category);

    switch (self.dataColorsSettings.fillType) {
        case ColorPaletteType.Single: {
            self.chartData.forEach((data) => {
                data.styles!.bar.fillColor = colorsSettings.barColor!;
            });

            Object.keys(self.subCategoriesColorMap).forEach(d => {
                self.subCategoriesColorMap[d] = colorsSettings.barColor;
            });
            break;
        }
        case ColorPaletteType.PowerBi: {
            self.chartData.forEach((d) => {
                d.styles!.bar.fillColor = self.colorPalette.getColor(d.category).value;
            });

            Object.keys(self.subCategoriesColorMap).forEach(d => {
                self.subCategoriesColorMap[d] = self.colorPalette.getColor(d).value;
            });
            break;
        }
        case ColorPaletteType.Gradient: {
            const categoryDataLength = self.categoricalDataPairsSortedByHigherValues.length;
            const domain =
                colorsSettings.midcolor && categoryDataLength > 2
                    ? [1, Math.round(categoryDataLength / 2), categoryDataLength]
                    : [1, categoryDataLength];
            const range: any =
                colorsSettings.midcolor && categoryDataLength > 2
                    ? self.isHorizontalChart ? [colorsSettings.fillmid, colorsSettings.fillmin, colorsSettings.fillmax] : [colorsSettings.fillmax, colorsSettings.fillmin, colorsSettings.fillmid]
                    : self.isHorizontalChart ? [colorsSettings.fillmin, colorsSettings.fillmax] : [colorsSettings.fillmax, colorsSettings.fillmin];

            self.gradientColorScale.domain(domain).range(range);

            const categoryColorPair = self.categoricalDataPairsSortedByHigherValues.reduce((obj, cur) => {
                obj[cur.category] = "";
                return obj;
            }, {});
            const keys = Object.keys(categoryColorPair);

            if (colorsSettings.isGradientWithinBar) {
                self.chartData.forEach((d) => {
                    d.styles!.bar.fillColor = GetGradientWithinBarColor(self);
                });
            } else {
                keys.forEach((key, i) => {
                    const color: string = self.gradientColorScale(i + 1) + "";
                    categoryColorPair[key] = color;
                });

                self.chartData.forEach((d) => {
                    d.styles!.bar.fillColor = categoryColorPair[d.category];
                });

                Object.keys(self.subCategoriesColorMap).forEach(d => {
                    self.subCategoriesColorMap[d] = categoryColorPair[d];
                });
            }

            break;
        }
        case ColorPaletteType.ByCategory: {
            self.chartData.forEach((d) => {
                d.styles!.bar.fillColor =
                    colorsSettings.subCategoriesColorMap[d.category] ?? self.colorPalette.getColor(d.category).value;
            });
            break;
        }
        case ColorPaletteType.Sequential: {
            SetBarSchemaColors(self, colorsSettings.schemeColors);
            break;
        }
        case ColorPaletteType.Diverging: {
            SetBarSchemaColors(self, colorsSettings.schemeColors);
            break;
        }
        case ColorPaletteType.Qualitative: {
            SetBarSchemaColors(self, colorsSettings.schemeColors);
            break;
        }
        case ColorPaletteType.IBCSTheme: {
            self.chartData.forEach((data) => {
                data.styles!.bar.fillColor = "#404040";
            });
            // self.setBarSchemaColors(colorsSettings.schemeColors);
            break;
        }
    }
}

export const SetBarSchemaColors = (self: Visual, schemeColors: string[] = []): void => {
    const categoryColorMap = new Map();
    const keys = self.categoricalDataPairsSortedByHigherValues.map(d => d.category);

    let colorSchemes = chroma.scale(schemeColors);
    const colorIdxRangeScale = scaleLinear()
        .domain(self.isHorizontalChart ? [keys.length - 1, 0] : [0, keys.length - 1])
        .range([1, 0]);
    let colorIdx = 0;
    keys.forEach((key, i) => {
        colorSchemes.classes(keys.length);
        const color = "rgb(" + colorSchemes(colorIdxRangeScale(colorIdx)).rgb().join() + ")";
        categoryColorMap.set(key.toString(), color);
        colorIdx++;
    });

    self.chartData.forEach((d) => {
        d.styles!.bar.fillColor = categoryColorMap.get(d.category);
    });

    Object.keys(self.subCategoriesColorMap).forEach(d => {
        self.subCategoriesColorMap[d] = categoryColorMap.get(d);
    });
}

export const SetStackedGroupedBarColors = (self: Visual): void => {
    self.colorPalette.reset();
    const dataColors = self.dataColorsSettings;
    switch (dataColors.fillType) {
        case ColorPaletteType.Single: {
            self.chartData.forEach((data) => {
                data.subCategories!.forEach((d) => {
                    d.styles!.bar.fillColor = dataColors.barColor!;
                });
            });
            break;
        }
        case ColorPaletteType.PowerBi: {
            self.chartData.forEach((data) => {
                data.subCategories!.forEach((d) => {
                    d.styles!.bar.fillColor = self.colorPalette.getColor(d.category).value;
                });
            });
            break;
        }
        case ColorPaletteType.Gradient: {
            self.chartData.forEach((data) => {
                const subCategoryDataLength = data.subCategories!.length;
                const range: any =
                    dataColors.midcolor && subCategoryDataLength > 2
                        ? [dataColors.fillmax, dataColors.fillmid, dataColors.fillmin]
                        : [dataColors.fillmax, dataColors.fillmin];
                const domain =
                    dataColors.midcolor && subCategoryDataLength > 2
                        ? [1, Math.round(subCategoryDataLength / 2), subCategoryDataLength]
                        : [subCategoryDataLength, 1];
                self.gradientColorScale.domain(domain).range(range);
                if (dataColors.isGradientWithinBar && self.chartSettings.barType === BarType.Grouped) {
                    data.subCategories!.forEach((d, i) => {
                        d.styles!.bar.fillColor = GetGradientWithinBarColor(self);
                    });
                } else {
                    data.subCategories!.forEach((d, i) => {
                        const color: string = self.gradientColorScale(data.subCategories!.length - i) + "";
                        d.styles!.bar.fillColor = data.subCategories!.length > 1 ? color : data.styles!.bar.fillColor;
                    });
                }
            });
            break;
        }
        case ColorPaletteType.ByCategory: {
            self.chartData.forEach((data) => {
                data.subCategories!.forEach((d) => {
                    d.styles!.bar.fillColor =
                        dataColors.subCategoriesColorMap[d.category] ?? self.colorPalette.getColor(d.category).value;
                });
            });
            break;
        }
        case ColorPaletteType.Sequential: {
            SetStackedGroupedBarSchemaColors(self, dataColors.schemeColors);
            break;
        }
        case ColorPaletteType.Diverging: {
            SetStackedGroupedBarSchemaColors(self, dataColors.schemeColors);
            break;
        }
        case ColorPaletteType.Qualitative: {
            SetStackedGroupedBarSchemaColors(self, dataColors.schemeColors);
            break;
        }
        case ColorPaletteType.IBCSTheme: {
            SetStackedGroupedBarSchemaColors(self, dataColors.schemeColors);
            break;
        }
    }
}

export const SetStackedGroupedBarSchemaColors = (self: Visual, schemeColors: string[] = []): void => {
    let colorSchemes = chroma.scale(schemeColors);
    const getRangeScale = (min: number, max: number) => scaleLinear().domain([min, max]).range([0, 1]);
    self.chartData.forEach((data) => {
        let colorIdx = 0;
        const rangeScale = getRangeScale(data.subCategories!.length - 1, 0);
        data.subCategories!.forEach((d, i) => {
            if (data.subCategories!.length > 1) {
                // if (colorIdx >= schemeColors.length) {
                //   colorIdx = 0;
                // }
                const color =
                    "rgb(" +
                    colorSchemes(rangeScale(colorIdx++))
                        .rgb()
                        .join() +
                    ")";
                d.styles!.bar.fillColor = color;
            } else {
                d.styles!.bar.fillColor = data.styles!.bar.fillColor;
            }
        });
    });

    let colorIdx = 0;
    const rangeScale = getRangeScale(0, self.chartData.length - 1);
    self.chartData.forEach((data, i) => {
        if (colorIdx >= schemeColors.length) {
            colorIdx = 0;
        }
        const color =
            "rgb(" +
            colorSchemes(rangeScale(colorIdx++))
                .rgb()
                .join() +
            ")";
        data.styles!.bar.fillColor = color;
    });
}

export const SetSubCategoriesColor = (self: Visual): void => {
    const getSubCategoryColorByName = (subCategoryName: string): string => {
        let subCategory!: IVisualSubCategoryData;
        self.chartData.forEach((data) => {
            data.subCategories!.find((d) => {
                if (d.category === subCategoryName) {
                    subCategory = d;
                }
            });
        });

        const conditionalFormattedCategory = self.conditionalFormattingConditions.find(
            (c) => c.sourceName === subCategoryName && c.applyTo === DataRolesName.Value
        );

        if (conditionalFormattedCategory) {
            return conditionalFormattedCategory.color;
        } else {
            return subCategory ? subCategory.styles!.bar.fillColor : "#545454";
        }
    };

    self.subCategories.forEach((cat) => {
        cat.color = getSubCategoryColorByName(cat.name);
    });

    self.categoriesForLegend.forEach((cat) => {
        cat.color = getSubCategoryColorByName(cat.name);
    });
}

export const SetRemainingAsOthersDataColor = (self: Visual): void => {
    const rankingSettings = self.rankingSettings;
    const subCategoriesRanking = rankingSettings.subCategoriesRanking;

    if (!rankingSettings.isCategoriesRanking) {
        rankingSettings.count = self.chartData.length;
        rankingSettings.showRemainingAsOthers = false;
    }

    if (rankingSettings.isSubcategoriesRanking && rankingSettings.subCategoriesRanking.showRemainingAsOthers) {
        rankingSettings.barColor = rankingSettings.subCategoriesRanking.barColor;
    }

    if (rankingSettings.isCategoriesRanking && rankingSettings.showRemainingAsOthers) {
        if (rankingSettings.filterType === RankingFilterType.TopN) {
            self.chartData.forEach((d, i) => {
                if (self.isHorizontalChart) {
                    if (i + 1 <= self.chartData.length - rankingSettings.count) {
                        d.styles!.bar.fillColor = rankingSettings.barColor;
                        d.isOther = true;
                    }
                } else {
                    if (i + 1 > rankingSettings.count) {
                        d.styles!.bar.fillColor = rankingSettings.barColor;
                        d.isOther = true;
                    }
                }
            });
        }

        if (rankingSettings.filterType === RankingFilterType.BottomN) {
            if (rankingSettings.count <= self.chartData.length) {
                self.chartData.forEach((d, i) => {
                    if (self.isHorizontalChart) {
                        if (i + 1 <= self.chartData.length - rankingSettings.count) {
                            d.styles!.bar.fillColor = rankingSettings.barColor;
                            d.isOther = true;
                        }
                    } else {
                        if (i + 1 > rankingSettings.count) {
                            d.styles!.bar.fillColor = rankingSettings.barColor;
                            d.isOther = true;
                        }
                    }
                });
            }
        }
    }

    if (rankingSettings.isSubcategoriesRanking && subCategoriesRanking.showRemainingAsOthers) {
        const count = subCategoriesRanking.count;
        const subCategoriesCount = self.isGroupedStackedBar ? count * self.subCategories.length : count;

        if (self.chartSettings.barType !== BarType.Normal) {
            if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.TopN) {
                self.chartData.forEach((data, i1) => {
                    if (self.isHorizontalChart) {
                        if (
                            rankingSettings.filterType === RankingFilterType.TopN
                                ? i1 + 1 >= self.chartData.length - rankingSettings.count
                                : i1 + 1 <= rankingSettings.count
                        ) {
                            data.subCategories!.forEach((d, i2) => {
                                if (i2 + 1 > subCategoriesCount) {
                                    d.isOther = true;
                                    d.styles!.bar.fillColor = subCategoriesRanking.barColor;
                                }
                            });
                        }
                    } else {
                        if (
                            rankingSettings.filterType === RankingFilterType.TopN
                                ? i1 + 1 <= rankingSettings.count
                                : i1 + 1 >= self.chartData.length - rankingSettings.count
                        ) {
                            data.subCategories!.forEach((d, i2) => {
                                if (i2 + 1 > subCategoriesCount) {
                                    d.isOther = true;
                                    d.styles!.bar.fillColor = subCategoriesRanking.barColor;
                                }
                            });
                        }
                    }
                });
            }

            if (rankingSettings.subCategoriesRanking.filterType === RankingFilterType.BottomN) {
                self.chartData.forEach((data, i1) => {
                    if (self.isHorizontalChart) {
                        if (rankingSettings.showRemainingAsOthers) {
                            if (
                                rankingSettings.filterType === RankingFilterType.TopN
                                    ? i1 + 1 >= self.chartData.length - rankingSettings.count
                                    : i1 + 1 <= rankingSettings.count
                            ) {
                                data.subCategories!.forEach((d, i2) => {
                                    if (i2 + 1 > subCategoriesCount) {
                                        d.isOther = true;
                                        d.styles!.bar.fillColor = subCategoriesRanking.barColor;
                                    }
                                });
                            }
                        } else {
                            if (
                                rankingSettings.filterType === RankingFilterType.TopN
                                    ? i1 + 1 >= self.chartData.length - rankingSettings.count
                                    : i1 + 1 <= rankingSettings.count
                            ) {
                                data.subCategories!.forEach((d, i2) => {
                                    if (i2 + 1 > subCategoriesCount) {
                                        d.isOther = true;
                                        d.styles!.bar.fillColor = subCategoriesRanking.barColor;
                                    }
                                });
                            }
                        }
                    } else {
                        if (
                            rankingSettings.filterType === RankingFilterType.TopN
                                ? i1 + 1 <= rankingSettings.count
                                : i1 + 1 >= self.chartData.length - rankingSettings.count
                        ) {
                            data.subCategories!.forEach((d, i2) => {
                                if (i2 + 1 > subCategoriesCount) {
                                    d.isOther = true;
                                    d.styles!.bar.fillColor = subCategoriesRanking.barColor;
                                }
                            });
                        }
                    }
                });
            }
        }
    }

    self.setSubCategoriesMap(self.chartData);
    SetSubCategoriesColor(self);
}