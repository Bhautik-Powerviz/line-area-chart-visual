import { Visual } from "../visual";
import { Selection } from "d3-selection";
import { ILegendsDataPoint } from "../visual-data.model";
import { renderLegends } from "../legendHelper";
import { EVisualSettings } from "../enum";
type D3Selection<T extends d3.BaseType> = Selection<T, any, any, any>;

export const RenderLegends = (self: Visual): void => {
    self.legend = renderLegends(
        self.chartContainer,
        "",
        self.legendsData,
        self.visualUpdateOptions.formatTab[EVisualSettings.Legend],
        self.patternSettings.enable,
        self.isEditorOpened
    );

    self.updateChartDimensions(self.legend.legendWrapper);
}

export const SetLegendsData = (self: Visual): void => {
    let legendDataPoints: ILegendsDataPoint[] = [];
    const subCategories = self.categoriesForLegend.filter((s) => {
        // return !s.name.includes(this.othersBarText);
        return s;
    });

    if (
        subCategories.length &&
        (self.rankingSettings.isCategoriesRanking || self.rankingSettings.isSubcategoriesRanking) &&
        (self.rankingSettings.showRemainingAsOthers || self.rankingSettings.subCategoriesRanking.showRemainingAsOthers)
    ) {
        // subCategories.push({
        //   name: this.othersBarText,
        //   color: this.rankingSettings.showRemainingAsOthers
        //     ? this.rankingSettings.barColor
        //     : this.rankingSettings.subCategoriesRanking.showRemainingAsOthers
        //       ? this.rankingSettings.subCategoriesRanking.barColor
        //       : "",
        // });
    }

    legendDataPoints = subCategories.map((category) => ({
        data: {
            name: category.name,
            color: category.color,
            pattern: self.patternSettings.patterns.find((d) => d.category === category.name),
        },
    }));

    self.legendsData = legendDataPoints;
}

export const SetLegendFadeOffItemClass = (selection: D3Selection<HTMLElement>): void => {
    selection.classed("fade-off-legend-item", true).classed("active-legend-item", false);
}

export const SetLegendItemActiveClass = (selection: D3Selection<HTMLElement>): void => {
    selection.classed("active-legend-item", true).classed("fade-off-legend-item", false);
}
