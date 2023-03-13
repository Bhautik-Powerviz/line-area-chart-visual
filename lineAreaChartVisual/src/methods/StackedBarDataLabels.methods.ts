import { Visual } from "../visual";
import { select as d3Select, Selection } from "d3-selection";
import { DataLabelsPlacement, FontStyle } from "../enum";
import { IDataLabelsProps } from "../visual-settings.model";
import { easeLinear } from "d3";
import { GetFormattedNumber } from "./NumberFormat.methods";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderStackedBarsInsideDataLabels = (self: Visual, stackedBarData: any[]): void => {
    const dataLabelsData = stackedBarData.reduce((arr, value) => {
        arr.push(...value.components);
        return arr;
    }, []);

    const dataLabelsGSelection = self.stackedBarDataLabelsG
        .selectAll(".stackedBarDataLabelG")
        .data(dataLabelsData, (d) => d?.id);

    dataLabelsGSelection.join(
        (enter) => {
            const dataLabelGSelection = enter
                .append("g")
                .attr("id", "dataLabel")
                .attr("class", "stackedBarDataLabelG")
                .attr("opacity", 0);
            const rectSelection = dataLabelGSelection.append("rect").attr("class", "dataLabelRect");
            const textBorderSelection = dataLabelGSelection.append("text").attr("class", "dataLabelTextBorder");
            const textSelection = dataLabelGSelection.append("text").attr("class", "dataLabelText");
            FormattingStackedBarInsideDataLabels(self, textSelection, textBorderSelection, rectSelection);
            if (self.isHorizontalChart) {
                FormattingHorizontalStackedBarDataLabel(self, dataLabelGSelection, false);
            } else {
                FormattingVerticalStackedBarDataLabel(self, dataLabelGSelection, false);
            }
        },
        (update) => {
            update.attr("id", "dataLabel").attr("class", "stackedBarDataLabelG");
            const textSelection = update.selectAll(".dataLabelText");
            const textBorderSelection = update.selectAll(".dataLabelTextBorder");
            const rectSelection = update.selectAll(".dataLabelRect");
            FormattingStackedBarInsideDataLabels(self, textSelection, textBorderSelection, rectSelection);
            if (self.isHorizontalChart) {
                FormattingHorizontalStackedBarDataLabel(self, update, true);
            } else {
                FormattingVerticalStackedBarDataLabel(self, update, true);
            }
        }
    );
}

export const FormattingStackedBarInsideDataLabels = (self: Visual, textSelection: D3Selection<SVGElement>, textBorderSelection: D3Selection<SVGElement>, rectSelection: D3Selection<SVGElement>): void => {
    const dataLabelsSettings: IDataLabelsProps = self.dataLabelsSettings.dataLabels;
    const fontSize = self.getDataLabelsFontSize(dataLabelsSettings);

    textSelection
        .attr("fill", (d) => {
            return self.getDataLabelTextColors(d.label.value, dataLabelsSettings.color);
        })
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize)
        .style("font-family", dataLabelsSettings.fontFamily)
        .style("font-weight", dataLabelsSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "")
        .style("font-style", dataLabelsSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "")
        .text((d) => GetFormattedNumber(self, d.label.value, true));

    if (textBorderSelection) {
        textBorderSelection
            .attr("stroke", dataLabelsSettings.textStrokeColor as string)
            .attr("stroke-width", dataLabelsSettings.textStrokeWidth as number)
            .attr("stroke-linejoin", "round")
            .attr("text-anchor", "middle")
            .attr("font-size", fontSize)
            .attr("display", (d) => {
                const pattern = self.subCategoriesMap[d.key].pattern;
                return self.patternSettings.enable && pattern?.patternIdentifier?.length ? "block" : "none";
            })
            .style("font-family", dataLabelsSettings.fontFamily)
            .style("font-weight", dataLabelsSettings.fontStyle.includes(FontStyle.Bold) ? "bold" : "")
            .style("font-style", dataLabelsSettings.fontStyle.includes(FontStyle.Italic) ? "italic" : "")
            .text((d) => GetFormattedNumber(self, d.label.value, true));
    }

    rectSelection
        .attr("width", 0)
        .attr("width", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".dataLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.width + fontSize;
        })
        .attr("height", 0)
        .attr("height", function () {
            const getBBox = (d3Select(this.parentNode as any).select(".dataLabelText").node() as SVGSVGElement).getBBox();
            return getBBox.height + fontSize * 0.4;
        })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", dataLabelsSettings.backgroundColor)
        .attr("opacity", "0");

    rectSelection
        .attr("fill-opacity", `${100 - dataLabelsSettings.transparency}% `)
        .attr("opacity", dataLabelsSettings.showBackground ? "1" : "0");

    textSelection.attr("transform", function () {
        const bBox = (d3Select(this.parentNode as any).select("rect").node() as SVGSVGElement).getBBox();
        return `translate(${bBox.width / 2},
                ${bBox.height - 1.5 - fontSize * 0.4})`;
    });

    if (textBorderSelection) {
        textBorderSelection.attr("transform", function () {
            const bBox = (d3Select(this.parentNode as any).select("rect").node() as SVGSVGElement).getBBox();
            return `translate(${bBox.width / 2},
                    ${bBox.height - 1.5 - fontSize * 0.4})`;
        });
    }
}

export const FormattingHorizontalStackedBarDataLabel = (self: Visual, dataLabelSelection: D3Selection<SVGElement>, isUpdateMode: boolean): void => {
    const THIS = self;
    const dataLabelsPlacement = self.dataLabelsSettings.dataLabels.placement;

    const getBarWidth = (d) => {
        if (self.isLeftYAxis) {
            const calcWidth = Math.abs((self.xScale(d[1]) ?? 0) - (self.xScale(d[0]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        } else {
            const calcWidth = Math.abs((self.xScale(d[0]) ?? 0) - (self.xScale(d[1]) ?? 0));
            return calcWidth > 0 ? calcWidth : 0;
        }
    };
    const barHeight = self.scaleBandWidth / 2;
    const distanceToBarBorder = 5;

    const getDataLabelXY = (dataLabelEle: any, data: any) => {
        const d = data;
        const labelBBox = dataLabelEle.getBBox();
        const barWidth = getBarWidth(d);
        let x = 0;
        const labelWidth = labelBBox.width;
        const labelHeight = labelBBox.height;
        let y =
            (THIS.yScale(d.data?.category) ?? 0) -
            THIS.scaleBandWidth / 4 +
            barHeight / 2 -
            labelBBox.height / 2 +
            (THIS.isGroupedStackedBar
                ? THIS.groupedBarBandScale(d.data?.groupedCategory) + THIS.groupedBarScaleBandWidth / 2
                : 0);

        if (self.isStackedBarChart) {
            y += self.scaleBandWidth / 2;
        }

        if (dataLabelsPlacement === DataLabelsPlacement.End) {
            x = (THIS.xScale(THIS.isLeftYAxis ? d[1] : d[0]) ?? 0) + distanceToBarBorder;
            x += THIS.isLeftYAxis ? 0 : barWidth - labelWidth;
        } else if (dataLabelsPlacement === DataLabelsPlacement.Center) {
            x = (THIS.xScale(THIS.isLeftYAxis ? d[1] : d[0]) ?? 0) + barWidth / 2 - labelWidth / 2;
        } else if (dataLabelsPlacement === DataLabelsPlacement.Base) {
            x = (THIS.xScale(THIS.isLeftYAxis ? d[1] : d[0]) ?? 0) + barWidth - distanceToBarBorder;
            x -= THIS.isLeftYAxis ? labelWidth : barWidth;
        }
        return { x, y };
    };

    if (!isUpdateMode) {
        dataLabelSelection
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${0}, ${y ?? 0})`;
            })
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${x ?? 0}, ${y ?? 0})`;
            });
    } else {
        dataLabelSelection
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${x ?? 0}, ${y ?? 0})`;
            });
    }

    dataLabelSelection.each(function (d) {
        const bBox = (d3Select(this).node() as SVGSVGElement).getBBox();
        const opacity = bBox.width > getBarWidth(d) || bBox.height > barHeight ? 0 : 1;
        d3Select(this).attr("opacity", opacity);
    });
}

export const FormattingVerticalStackedBarDataLabel = (self: Visual, dataLabelSelection: D3Selection<SVGSVGElement>, isUpdateMode: boolean): void => {
    const THIS = self;
    const dataLabelsPlacement = self.dataLabelsSettings.dataLabels.placement;

    const getLabelHeight = (d) => {
        if (self.isBottomXAxis) {
            return Math.abs(self.yScale(d[0] ?? 0) - self.yScale(d[1]) ?? 0);
        } else {
            const calcHeight = Math.abs(self.yScale(d[1] ?? 0) - self.yScale(d[0]) ?? 0);
            return calcHeight > 0 ? calcHeight : 0;
        }
    };
    const barWidth = self.scaleBandWidth / 2;
    const distanceToBarBorder = 5;

    const getDataLabelXY = (dataLabelEle: any, data: any) => {
        const labelBBox = dataLabelEle.getBBox();
        const d = data;
        let x =
            THIS.xScale(d.data?.category) +
            (THIS.isGroupedStackedBar
                ? THIS.groupedBarBandScale(d.data?.groupedCategory) + THIS.groupedBarScaleBandWidth / 2
                : 0);

        if (self.isStackedBarChart) {
            x += self.scaleBandWidth / 2;
        }

        const height = getLabelHeight(d);
        let y: number = 0;
        const labelWidth = labelBBox.width;
        const labelHeight = labelBBox.height;
        if (dataLabelsPlacement === DataLabelsPlacement.End) {
            x -= labelWidth / 2;
            y = THIS.yScale(THIS.isBottomXAxis ? d[0] : d[1]) + distanceToBarBorder;
            y += THIS.isBottomXAxis ? 0 : height - labelHeight;
        } else if (dataLabelsPlacement === DataLabelsPlacement.Center) {
            x -= labelWidth / 2;
            y = (THIS.yScale(THIS.isBottomXAxis ? d[0] : d[1]) ?? 0) + height / 2 - labelHeight / 2;
        } else if (dataLabelsPlacement === DataLabelsPlacement.Base) {
            x -= labelWidth / 2;
            y = THIS.yScale(THIS.isBottomXAxis ? d[0] : d[1]) + height - distanceToBarBorder;
            y -= THIS.isBottomXAxis ? labelHeight : height;
        }
        return { x, y };
    };

    if (!isUpdateMode) {
        dataLabelSelection
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${x ?? 0}, ${THIS.height ?? 0})`;
            })
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${x ?? 0}, ${y ?? 0})`;
            })
            .on("end", function (d) {
                const bBox = d3Select(this)?.node()?.getBBox();
                const opacity = bBox!.height > getLabelHeight(d) || bBox!.width > barWidth ? 0 : 1;
                d3Select(this)
                    .transition()
                    .duration(THIS.tickDuration / 2)
                    .ease(easeLinear)
                    .attr("opacity", opacity);
            });
    } else {
        dataLabelSelection
            .transition()
            .duration(self.tickDuration)
            .ease(easeLinear)
            .attr("transform", function (data) {
                const { x, y } = getDataLabelXY(this, data);
                return `translate(${x ?? 0}, ${y ?? 0})`;
            })
            .on("end", function (d) {
                const bBox = d3Select(this)!.node()!.getBBox();
                const opacity = bBox.height > getLabelHeight(d) || bBox.width > barWidth ? 0 : 1;
                d3Select(this)
                    .transition()
                    .duration(THIS.tickDuration / 2)
                    .ease(easeLinear)
                    .attr("opacity", opacity);
            });
    }
}