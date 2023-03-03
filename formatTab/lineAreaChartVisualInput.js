const visualPath = "../lineAreaChartVisual";

const sectionKVPair = [
  { license: "PowerVIZ License" },
  { editor: "Editor" },
  { chartConfig: "Chart Configuration" }
];

const formatTab = {
  editor: [
    {
      technicalName: "annotations",
      displayName: "Annotations",
      description: "",
      type: "text",
      defaultValue: "[]",
    },
  ],
  license: [
    {
      technicalName: "purchased",
      displayName: "",
      description: "",
      type: "text",
      defaultValue: "",
    },
    {
      technicalName: "customer",
      displayName: "Licensed To",
      description: "",
      type: "text",
      defaultValue: "",
    },
    {
      technicalName: "key",
      displayName: "License",
      type: "text",
      defaultValue: "",
    },
  ],
  chartConfig: [
    {
      technicalName: "chartSettings",
      displayName: "Chart Settings",
      description: "",
      type: "text",
      defaultValue: "{}",
    },
  ]
};

module.exports = { visualPath, sectionKVPair, formatTab };
