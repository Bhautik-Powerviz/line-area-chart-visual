import { EnumerateSectionType } from "@truviz/shadow/dist/types/EnumerateSectionType";

export class Enumeration {
  public static GET(): EnumerateSectionType[] {
    return [
      getLicenseSelection(),
      getChartConfigSelection(),
      getGridLinesConfigSelection(),
      getDataColorsSelection(),
      getDataLabelsSelection(),
      getRankingSelection(),
      getSortingSelection(),
      getPatternSelection(),
      getXAxisConfigSelection(),
      getYAxisConfigSelection(),
      getEditorSelection(),
      getBarChartRaceSelection(),
      getErrorBarsSelection(),
      getSeriesLabelSelection(),
      getSmallMultiplesSelection(),
      dynamicDeviationSelection(),
      cutAndClipAxisSelection(),
    ];
  }
}

function getLicenseSelection(): EnumerateSectionType {
  return {
    name: "license",
    isShow: true,
    properties: [
      {
        name: "purchased",
        isShow: true,
      },
      {
        name: "customer",
        isShow: true,
      },
      {
        name: "key",
        isShow: true,
      },
    ],
  };
}

function getChartConfigSelection(): EnumerateSectionType {
  return {
    name: "chartConfig",
    isShow: false,
    properties: [
      {
        name: "chartSettings",
        isShow: true,
      },
    ],
  };
}

function getDataLabelsSelection(): EnumerateSectionType {
  return {
    name: "dataLabelsConfig",
    isShow: false,
    properties: [
      {
        name: "dataLabelsSettings",
        isShow: true,
      },
    ],
  };
}

function getDataColorsSelection(): EnumerateSectionType {
  return {
    name: "dataColorsConfig",
    isShow: false,
    properties: [
      {
        name: "dataColorsSettings",
        isShow: true,
      },
    ],
  };
}

function getRankingSelection(): EnumerateSectionType {
  return {
    name: "rankingConfig",
    isShow: false,
    properties: [
      {
        name: "rankingSettings",
        isShow: true,
      },
    ],
  };
}

function getSortingSelection(): EnumerateSectionType {
  return {
    name: "sortingConfig",
    isShow: false,
    properties: [
      {
        name: "sortingSettings",
        isShow: true,
      },
    ],
  };
}

function getGridLinesConfigSelection(): EnumerateSectionType {
  return {
    name: "gridLinesConfig",
    isShow: false,
    properties: [
      {
        name: "gridLinesSettings",
        isShow: true,
      },
    ],
  };
}

function getPatternSelection(): EnumerateSectionType {
  return {
    name: "patternConfig",
    isShow: false,
    properties: [
      {
        name: "patternSettings",
        isShow: true,
      },
    ],
  };
}

function getXAxisConfigSelection(): EnumerateSectionType {
  return {
    name: "xAxisConfig",
    isShow: true,
    properties: [
      {
        name: "xAxisSettings",
        isShow: true,
      },
    ],
  };
}

function getYAxisConfigSelection(): EnumerateSectionType {
  return {
    name: "yAxisConfig",
    isShow: true,
    properties: [
      {
        name: "yAxisSettings",
        isShow: true,
      },
    ],
  };
}

function getEditorSelection(): EnumerateSectionType {
  return {
    name: "editor",
    isShow: true,
    properties: [
      {
        name: "conditionalFormatting",
        isShow: true,
      },
      {
        name: "annotations",
        isShow: true,
      },
    ],
  };
}

function getBarChartRaceSelection(): EnumerateSectionType {
  return {
    name: "barChartRaceConfig",
    isShow: false,
    properties: [
      {
        name: "barChartRaceSettings",
        isShow: true,
      },
    ],
  };
}

function getErrorBarsSelection(): EnumerateSectionType {
  return {
    name: "errorBarsConfig",
    isShow: false,
    properties: [
      {
        name: "errorBarsSettings",
        isShow: true,
      },
    ],
  };
}

function getSeriesLabelSelection(): EnumerateSectionType {
  return {
    name: "seriesLabelConfig",
    isShow: false,
    properties: [
      {
        name: "seriesLabelSettings",
        isShow: true,
      },
    ],
  };
}

function getSmallMultiplesSelection(): EnumerateSectionType {
  return {
    name: "smallMultiplesConfig",
    isShow: false,
    properties: [
      {
        name: "smallMultiplesSettings",
        isShow: true,
      },
    ],
  };
}

function dynamicDeviationSelection(): EnumerateSectionType {
  return {
    name: "dynamicDeviationConfig",
    isShow: false,
    properties: [
      {
        name: "dynamicDeviationSettings",
        isShow: true,
      },
    ],
  };
}

function cutAndClipAxisSelection(): EnumerateSectionType {
  return {
    name: "cutAndClipAxisConfig",
    isShow: false,
    properties: [
      {
        name: "cutAndClipAxisSettings",
        isShow: true,
      },
    ],
  };
}
