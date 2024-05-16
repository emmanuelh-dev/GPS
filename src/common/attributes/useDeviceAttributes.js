import { useMemo } from "react";

export default (t) =>
  useMemo(
    () => ({
      termo: {
        name: "Termo",
        type: "string",
        subtype: "color",
      },
      // "web.reportColor": {
      //   name: t("attributeWebReportColor"),
      //   type: "string",
      //   subtype: "color",
      // },
      // devicePassword: {
      //   name: t("attributeDevicePassword"),
      //   type: "string",
      // },
      // deviceImage: {
      //   name: t("attributeDeviceImage"),
      //   type: "string",
      // },
      // "processing.copyAttributes": {
      //   name: t("attributeProcessingCopyAttributes"),
      //   type: "string",
      // },
      // "decoder.timezone": {
      //   name: t("sharedTimezone"),
      //   type: "string",
      // },
      // deviceInactivityStart: {
      //   name: t("attributeDeviceInactivityStart"),
      //   type: "number",
      // },
      // deviceInactivityPeriod: {
      //   name: t("attributeDeviceInactivityPeriod"),
      //   type: "number",
      // },
    }),
    [t],
  );
