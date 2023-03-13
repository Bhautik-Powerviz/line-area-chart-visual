import { BarType, ColorPaletteType, DataLabelsPlacement, EDataLabelsSettings, ESeriesLabelSettings, EVisualConfig, EVisualSettings, EXAxisSettings } from "../enum";
import { Visual } from "../visual";
import { RenderSeriesLabels } from "./SeriesLabels.methods";

export const ApplyPreviousSettingsAfterIBCSApplied = (self: Visual): void => {
    const {
        barXPadding,
        barYPadding,
        isShowBarBorder,
        barBorderColor,
        barBorderWidth,
        colorScheme,
        fillType,
        schemeColors,
        dataLabelsPlacement,
        dataLabelsColor,
        dataLabelsShowBackground,
        totalLabelsColor,
        totalLabelsShowBackground,
        seriesLabelSettingsFontColor,
        seriesLabelSettingsShowBackground,
        xAxisSettingsLabelColor,
        xAxisSettingsTitleColor,
        yAxisSettingsLabelColor,
        yAxisSettingsTitleColor,
    } = self.settingsBeforeIBCSApplied;
    self.chartSettings.barXPadding = barXPadding;
    self.chartSettings.barYPadding = barYPadding;
    self.chartSettings.isShowBarBorder = isShowBarBorder;
    self.chartSettings.barBorderColor = barBorderColor;
    self.chartSettings.barBorderWidth = barBorderWidth;
    self.dataColorsSettings.colorScheme = colorScheme;
    self.dataColorsSettings.fillType = fillType;
    self.dataColorsSettings.schemeColors = schemeColors;
    self.dataLabelsSettings.dataLabels.placement = dataLabelsPlacement;
    self.dataLabelsSettings.dataLabels.color = dataLabelsColor;
    self.dataLabelsSettings.dataLabels.showBackground = dataLabelsShowBackground;
    self.dataLabelsSettings.totalLabels.color = totalLabelsColor;
    self.dataLabelsSettings.totalLabels.showBackground = totalLabelsShowBackground;
    self.seriesLabelSettings.fontColor = seriesLabelSettingsFontColor;
    self.seriesLabelSettings.showBackground = seriesLabelSettingsShowBackground;
    self.xAxisSettings.labelColor = xAxisSettingsLabelColor;
    self.xAxisSettings.titleColor = xAxisSettingsTitleColor;
    self.yAxisSettings.labelColor = yAxisSettingsLabelColor;
    self.yAxisSettings.titleColor = yAxisSettingsTitleColor;

    self.visualHost.persistProperties({
        merge: [
            {
                objectName: EVisualConfig.ChartConfig,
                displayName: EVisualSettings.ChartSettings,
                properties: {
                    [EVisualSettings.ChartSettings]: JSON.stringify({
                        ...self.chartSettings,
                        barXPadding: barXPadding,
                        barYPadding: barYPadding,
                        isShowBarBorder: isShowBarBorder,
                        barBorderColor: barBorderColor,
                        barBorderWidth: barBorderWidth,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.DataColorsConfig,
                displayName: EVisualSettings.DataColorsSettings,
                properties: {
                    [EVisualSettings.DataColorsSettings]: JSON.stringify({
                        ...self.dataColorsSettings,
                        colorScheme: colorScheme,
                        fillType: fillType,
                        schemeColors: schemeColors,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.DataLabelsConfig,
                displayName: EVisualSettings.DataLabelsSettings,
                properties: {
                    [EVisualSettings.DataLabelsSettings]: JSON.stringify({
                        ...self.dataLabelsSettings,
                        [EDataLabelsSettings.dataLabels]: {
                            ...self.dataLabelsSettings[EDataLabelsSettings.dataLabels],
                            [EDataLabelsSettings.placement]: dataLabelsPlacement,
                            [EDataLabelsSettings.color]: dataLabelsColor,
                            [EDataLabelsSettings.showBackground]: dataLabelsShowBackground
                        },
                        [EDataLabelsSettings.totalLabels]: {
                            ...self.dataLabelsSettings[EDataLabelsSettings.totalLabels],
                            [EDataLabelsSettings.color]: totalLabelsColor,
                            [EDataLabelsSettings.showBackground]: totalLabelsShowBackground
                        }
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.SeriesLabelConfig,
                displayName: EVisualSettings.SeriesLabelSettings,
                properties: {
                    [EVisualSettings.SeriesLabelSettings]: JSON.stringify({
                        ...self.seriesLabelSettings,
                        [ESeriesLabelSettings.FontColor]: seriesLabelSettingsFontColor,
                        [ESeriesLabelSettings.ShowBackground]: seriesLabelSettingsShowBackground,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.XAxisConfig,
                displayName: EVisualSettings.XAxisSettings,
                properties: {
                    [EVisualSettings.XAxisSettings]: JSON.stringify({
                        ...self.xAxisSettings,
                        [EXAxisSettings.labelColor]: xAxisSettingsLabelColor,
                        [EXAxisSettings.titleColor]: xAxisSettingsTitleColor,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.YAxisConfig,
                displayName: EVisualSettings.YAxisSettings,
                properties: {
                    [EVisualSettings.YAxisSettings]: JSON.stringify({
                        ...self.yAxisSettings,
                        [EXAxisSettings.labelColor]: yAxisSettingsLabelColor,
                        [EXAxisSettings.titleColor]: yAxisSettingsTitleColor,
                    }),
                },
                selector: '',
            },
        ],
    });
}

export const ApplyIBCSTheme = (self: Visual): void => {
    self.settingsBeforeIBCSApplied = {
        barXPadding: self.chartSettings.barXPadding,
        barYPadding: self.chartSettings.barYPadding,
        isShowBarBorder: self.chartSettings.isShowBarBorder,
        barBorderColor: self.chartSettings.barBorderColor,
        barBorderWidth: self.chartSettings.barBorderWidth,
        colorScheme: self.dataColorsSettings.colorScheme,
        fillType: self.dataColorsSettings.fillType,
        schemeColors: self.dataColorsSettings.schemeColors,
        dataLabelsPlacement: self.dataLabelsSettings.dataLabels.placement,
        dataLabelsColor: self.dataLabelsSettings.dataLabels.color,
        dataLabelsShowBackground: self.dataLabelsSettings.dataLabels.showBackground,
        totalLabelsColor: self.dataLabelsSettings.totalLabels.color,
        totalLabelsShowBackground: self.dataLabelsSettings.totalLabels.showBackground,
        seriesLabelSettingsFontColor: self.seriesLabelSettings.fontColor,
        seriesLabelSettingsShowBackground: self.seriesLabelSettings.showBackground,
        xAxisSettingsLabelColor: self.xAxisSettings.labelColor,
        xAxisSettingsTitleColor: self.xAxisSettings.titleColor,
        yAxisSettingsLabelColor: self.yAxisSettings.labelColor,
        yAxisSettingsTitleColor: self.yAxisSettings.titleColor,
    };

    // IBCS Settings
    if (self.chartSettings.barType === BarType.Stacked || self.chartSettings.barType === BarType.GroupedStacked) {
        if (self.isSeriesLabelWithIBCSThemeApplied)
            if (self.seriesLabelSettings.isSeriesLabelEnabled) {
                self.isShowSeriesLabel = true;
                RenderSeriesLabels(self, self.stackedBarChartData);
            } else {
                self.isShowSeriesLabel = false;
                RenderSeriesLabels(self, []);
            }
    } else {
        RenderSeriesLabels(self, []);
        self.isShowSeriesLabel = false;
    }

    self.chartSettings.barXPadding = 0;
    self.chartSettings.barYPadding = 0;
    self.chartSettings.isShowBarBorder = true;
    self.chartSettings.barBorderColor = "rgb(0, 0, 0)";
    self.chartSettings.barBorderWidth = 1;

    self.dataColorsSettings.colorScheme = "IBCS Colors";
    self.dataColorsSettings.fillType = ColorPaletteType.IBCSTheme;
    self.dataColorsSettings.schemeColors = ["#DBDBDB", "#BEBEBE", "#808080", "#6D6D6D", "#505050", "#404040"];

    self.isIBCSThemeAlreadyApplied = true;

    self.visualHost.persistProperties({
        merge: [
            {
                objectName: EVisualConfig.ChartConfig,
                displayName: EVisualSettings.ChartSettings,
                properties: {
                    [EVisualSettings.ChartSettings]: JSON.stringify({
                        ...self.chartSettings,
                        barXPadding: 0,
                        barYPadding: 0,
                        isShowBarBorder: true,
                        barBorderColor: "rgb(0, 0, 0)",
                        barBorderWidth: 1,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.DataColorsConfig,
                displayName: EVisualSettings.DataColorsSettings,
                properties: {
                    [EVisualSettings.DataColorsSettings]: JSON.stringify({
                        ...self.dataColorsSettings,
                        colorScheme: "IBCS Colors",
                        fillType: "ibcsTheme",
                        schemeColors: ["#DBDBDB", "#BEBEBE", "#808080", "#6D6D6D", "#505050", "#404040"],
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.DataLabelsConfig,
                displayName: EVisualSettings.DataLabelsSettings,
                properties: {
                    [EVisualSettings.DataLabelsSettings]: JSON.stringify({
                        ...self.dataLabelsSettings,
                        [EDataLabelsSettings.dataLabels]: {
                            ...self.dataLabelsSettings[EDataLabelsSettings.dataLabels],
                            [EDataLabelsSettings.placement]: self.isNormalBarChart ? DataLabelsPlacement.OutSide : DataLabelsPlacement.Center,
                            [EDataLabelsSettings.color]: self.isNormalBarChart ? 'rgb(0, 0, 0)' : 'rgb(255, 255, 255)',
                            [EDataLabelsSettings.showBackground]: false
                        },
                        [EDataLabelsSettings.totalLabels]: {
                            ...self.dataLabelsSettings[EDataLabelsSettings.totalLabels],
                            [EDataLabelsSettings.color]: 'rgb(0, 0, 0)',
                            [EDataLabelsSettings.showBackground]: false
                        }
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.SeriesLabelConfig,
                displayName: EVisualSettings.SeriesLabelSettings,
                properties: {
                    [EVisualSettings.SeriesLabelSettings]: JSON.stringify({
                        ...self.seriesLabelSettings,
                        [ESeriesLabelSettings.FontColor]: 'rgb(0, 0, 0)',
                        [ESeriesLabelSettings.ShowBackground]: false,
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.XAxisConfig,
                displayName: EVisualSettings.XAxisSettings,
                properties: {
                    [EVisualSettings.XAxisSettings]: JSON.stringify({
                        ...self.xAxisSettings,
                        [EXAxisSettings.labelColor]: 'rgb(0, 0, 0)',
                        [EXAxisSettings.titleColor]: 'rgb(0, 0, 0)',
                    }),
                },
                selector: '',
            },
            {
                objectName: EVisualConfig.YAxisConfig,
                displayName: EVisualSettings.YAxisSettings,
                properties: {
                    [EVisualSettings.YAxisSettings]: JSON.stringify({
                        ...self.yAxisSettings,
                        [EXAxisSettings.labelColor]: 'rgb(0, 0, 0)',
                        [EXAxisSettings.titleColor]: 'rgb(0, 0, 0)',
                    }),
                },
                selector: '',
            },
        ],
    });
}