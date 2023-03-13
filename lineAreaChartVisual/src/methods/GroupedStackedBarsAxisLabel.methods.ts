import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { IVisualCategoryData } from "../visual-data.model";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderGroupedStackedBarsAxisLabel = (self: Visual, data: IVisualCategoryData[]): void => {
    const labelWidth = self.isHorizontalChart ? self.groupedStackedBarsLabelWidth : self.groupedBarScaleBandWidth;
    const labelSelection = self.groupedStackedBarsLabelG.selectAll(".groupedStackedBarAxisLabel").data(data);
    labelSelection.join(
        (enter) => {
            const labelSelection = enter.append("text");
            FormattingGroupedStackedBarsAxisLabel(self, labelSelection);
            labelSelection
                .text((d) => d.groupedCategory)
                .each((d, i, nodes) => {
                    self.trimLabel(nodes[i], labelWidth, 15);
                });
        },
        (update) => {
            FormattingGroupedStackedBarsAxisLabel(self, update);
            update
                .text((d) => d.groupedCategory)
                .each((d, i, nodes) => {
                    self.trimLabel(nodes[i], labelWidth, 15);
                });
        }
    );
}

const FormattingGroupedStackedBarsAxisLabel = (self: Visual, labelSelection: D3Selection<SVGElement>): void => {
    const xAxisSettings = self.xAxisSettings;

    const getDY = (): string => {
        if (self.isHorizontalChart) {
            return "0.35em";
        } else {
            return self.isBottomXAxis ? "1.65em" : "-0.65em";
        }
    };

    labelSelection
        .attr("class", "groupedStackedBarAxisLabel")
        .attr("text-anchor", self.isHorizontalChart ? (self.isLeftYAxis ? "end" : "start") : "middle")
        .attr("dx", self.isHorizontalChart ? (self.isLeftYAxis ? "-1em" : "1em") : "0")
        .attr("dy", getDY())
        .attr("fill", xAxisSettings.labelColor)
        .style("font-family", xAxisSettings.labelFontFamily)
        .attr("font-size", xAxisSettings.labelFontSize)
        .attr("transform", (d) => {
            const xScaleDomain = self.xScale.domain();
            const yScaleDomain = self.yScale.domain();

            if (self.isHorizontalChart) {
                return `translate(${self.xScale(self.isLeftYAxis ? xScaleDomain[0] : xScaleDomain[0]) ?? 0}, ${(self.yScale(d.category) ?? 0) +
                    (self.groupedBarBandScale(d.groupedCategory) ?? 0) +
                    self.groupedBarScaleBandWidth / 2
                    })`;
            } else {
                return `translate(${(self.xScale(d.category) ?? 0) +
                    (self.groupedBarBandScale(d.groupedCategory) ?? 0) +
                    self.groupedBarScaleBandWidth / 2
                    }, ${self.yScale(self.isBottomXAxis ? yScaleDomain[0] : yScaleDomain[0]) ?? 0})`;
            }
        });
}
