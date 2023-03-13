import { Visual } from '../visual';
import { BarType, EAutoCustomType, EPlayPauseButton } from "../enum";
import { interval } from "d3";
import { CallXScaleOnAxisGroupWithTransition, CallYScaleOnAxisGroupWithTransition, SetYAxisDomain, SetYAxisTickStyle } from './YAxis.methods';
import { SetXAxisDomain, SetXAxisTickStyle } from "./XAxis.methods";
import { RemoveXYAxisImagesLabel, RenderXAxisImagesLabel, RenderYAxisImagesLabel, SetXYAxisTickPositionForImageLabel } from "./AxisImageLabel.methods";

export const StartBarChartRace = (self: Visual) => {
    if (self.ticker) {
        self.ticker.stop();
    }

    self.ticker = interval((e) => {
        const setDataWithAllPositiveCategory = () => {
            self.tickIndex++;
            self.raceBarKeyOnTick = self.raceBarKeysList[self.tickIndex];
            self.chartData = self.raceBarChartData.filter((d) => d.raceBarKey === self.raceBarKeyOnTick);
            self.sortCategoriesData();
            self.sortSubcategoriesData();
            // this.chartData = this.chartData.slice(0, this.maxBarCount);
            // const isHasDataWithZeroValue = this.chartData.some(d => d.value === 0);
            // if (isHasDataWithZeroValue) {
            //     setDataWithAllPositiveCategory();
            // }
        };

        setDataWithAllPositiveCategory();
        self.setColorsByDataColorsSettings();

        // UPDATE CHART
        if (self.isShowRegularXAxis) {
            SetXAxisDomain(self, true, self.categoricalData);
            // this.callXScaleOnAxisGroup();
            CallXScaleOnAxisGroupWithTransition(self, self.tickDuration);
        }

        if (self.isShowRegularYAxis) {
            SetYAxisDomain(self, true, self.categoricalData);
            // this.callYScaleOnAxisGroup();
            CallYScaleOnAxisGroupWithTransition(self, self.tickDuration);
        }

        SetXAxisTickStyle(self, self.xAxisG.node(), self.xScaleWidth, self.yScaleHeight);
        SetYAxisTickStyle(self, self.yAxisG.node());

        if (self.isHasImagesData && self.isLabelImageWithinAxis) {
            if (self.isHorizontalChart) {
                RenderYAxisImagesLabel(self);
            } else {
                RenderXAxisImagesLabel(self);
            }
        }

        RemoveXYAxisImagesLabel(self);
        SetXYAxisTickPositionForImageLabel(self);

        if (self.chartSettings.barType !== BarType.Normal) {
            self.setStackedGroupedBarChartData();
        }

        self.drawBarChart(
            self.chartData,
            self.groupedBarChartData,
            self.stackedBarChartData,
            self.getGroupedBarsDataLabelsData(self.groupedBarChartData)
        );

        self.raceBarDataLabelOnTick = self.chartData[0]?.raceBarDataLabel!;
        self.raceBarDateLabelText.text(self.raceBarDataLabelOnTick);

        if (self.raceBarKeysLength === self.tickIndex) {
            self.tickIndex = -2;
            setDataWithAllPositiveCategory();
            self.ticker.stop();
            self.isBarRacePlaying = false;
            RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
        }
    }, self.barChartRaceSettings.dataChangeInterval);
}

export const RenderRaceBarDataLabel = (self: Visual): void => {
    if (!self.isRaceBarDataLabelDrawn) {
        self.raceBarDateLabelText = self.raceBarDateLabelG.append("text").attr("class", "raceBarDataLabel");
    }

    const minFontSize = 24;
    const labelFontSize =
        self.barChartRaceSettings.labelFontSizeType === EAutoCustomType.Auto
            ? self.width * 0.04 > minFontSize
                ? self.width * 0.04
                : minFontSize
            : self.barChartRaceSettings.labelFontFamily;
    self.raceBarDateLabelText
        .text(self.raceBarDataLabelOnTick)
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth - self.settingsBtnWidth - self.legendViewPort.width - self.margin.right) +
            "," +
            self.height +
            ")"
        )
        .attr("fill", self.barChartRaceSettings.labelColor)
        .style("font-family", self.barChartRaceSettings.labelFontFamily)
        .style("font-size", labelFontSize);
    self.isRaceBarDataLabelDrawn = true;
}

export const RenderRaceBarTickerButton = (self: Visual): void => {
    const raceBarDateLabelTextBBox = (self.raceBarDateLabelText.node() as SVGSVGElement).getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);
    const tickerButton = self.tickerButtonG
        .attr("id", "tickerButton")
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth -
                self.settingsBtnWidth -
                self.legendViewPort.width -
                raceBarDateLabelTextBBox.width / 2 -
                tickerButtonRadius / 2) +
            "," +
            (self.height - tickerButtonRadius - raceBarDateLabelTextBBox.height) +
            ")"
        )
        .on("click", () => {
            self.isBarRacePlaying = !self.isBarRacePlaying;
            RenderTickerButtonPlayPausePath(self, self.isBarRacePlaying ? EPlayPauseButton.Pause : EPlayPauseButton.Play);

            if (!self.isBarRacePlaying) {
                self.ticker.stop();
            } else {
                StartBarChartRace(self);
            }
        });

    tickerButton
        .append("circle")
        .attr("id", "tickerCircle")
        .attr("r", tickerButtonRadius)
        .attr("fill", self.barChartRaceSettings.tickerButtonColor);

    tickerButton.append("path").attr("class", "tickerButtonPath").attr("fill", "white");

    RenderTickerButtonPlayPausePath(self, EPlayPauseButton.Play);
    self.isTickerButtonDrawn = true;
}

export const GetTickerButtonRadius = (self: Visual): number => {
    const minRadius = 30;
    return self.barChartRaceSettings.tickerButtonRadiusType === EAutoCustomType.Auto
        ? self.width * 0.03 > minRadius
            ? self.width * 0.03
            : minRadius
        : self.barChartRaceSettings.tickerButtonRadius;
}

export const RenderTickerButtonPlayPausePath = (self: Visual, buttonType: EPlayPauseButton) => {
    self.tickerButtonG
        .select(".tickerButtonPath")
        .attr(
            "d",
            buttonType === EPlayPauseButton.Play
                ? "M1576 927l-1328 738q-23 13-39.5 3t-16.5-36v-1472q0-26 16.5-36t39.5 3l1328 738q23 13 23 31t-23 31z"
                : "M144 479H48c-26.5 0-48-21.5-48-48V79c0-26.5 21.5-48 48-48h96c26.5 0 48 21.5 48 48v352c0 26.5-21.5 48-48 48zm304-48V79c0-26.5-21.5-48-48-48h-96c-26.5 0-48 21.5-48 48v352c0 26.5 21.5 48 48 48h96c26.5 0 48-21.5 48-48z"
        )
        .attr(
            "transform",
            buttonType === EPlayPauseButton.Play
                ? "translate(-8.203125, -10.9375) scale(0.01220703125)"
                : "translate(-9.5703125, -10.9375) scale(0.042724609375)"
        );
}

export const UpdateTickerButton = (self: Visual): void => {
    const raceBarDateLabelTextBBox = (self.raceBarDateLabelText.node() as SVGSVGElement).getBBox();
    const tickerButtonRadius = GetTickerButtonRadius(self);
    self.tickerButtonG
        .attr("id", "tickerButton")
        .attr(
            "transform",
            "translate(" +
            (self.viewPortWidth -
                self.settingsBtnWidth -
                self.legendViewPort.width -
                raceBarDateLabelTextBBox.width / 2 -
                tickerButtonRadius / 2) +
            "," +
            (self.height - tickerButtonRadius - raceBarDateLabelTextBBox.height) +
            ")"
        );

    self.tickerButtonG
        .select("#tickerCircle")
        .attr("r", tickerButtonRadius)
        .attr("fill", self.barChartRaceSettings.tickerButtonColor);
}