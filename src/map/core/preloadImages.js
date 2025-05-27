import { grey } from "@mui/material/colors";
import createPalette from "@mui/material/styles/createPalette";
import { loadImage, prepareIcon } from "./mapUtil";

import arrowSvg from '../../resources/images/arrow.svg';

import directionSvg from "../../resources/images/direction.svg";
import backgroundSvg from "../../resources/images/background.svg";
import animalSvg from "../../resources/images/icon/animal.svg";
import bicycleSvg from "../../resources/images/icon/bicycle.svg";
import boatSvg from "../../resources/images/icon/boat.svg";
import busSvg from "../../resources/images/icon/bus.svg";
import carSvg from "../../resources/images/icon/car.svg";
import craneSvg from "../../resources/images/icon/crane.svg";
import defaultSvg from "../../resources/images/icon/default.svg";
import helicopterSvg from "../../resources/images/icon/helicopter.svg";
import motorcycleSvg from "../../resources/images/icon/motorcycle.svg";
import offroadSvg from "../../resources/images/icon/offroad.svg";
import personSvg from "../../resources/images/icon/person.svg";
import pickupSvg from "../../resources/images/icon/pickup.svg";
import planeSvg from "../../resources/images/icon/plane.svg";
import scooterSvg from "../../resources/images/icon/scooter.svg";
import shipSvg from "../../resources/images/icon/ship.svg";
import tractorSvg from "../../resources/images/icon/tractor.svg";
import trainSvg from "../../resources/images/icon/train.svg";
import tramSvg from "../../resources/images/icon/tram.svg";
import trolleybusSvg from "../../resources/images/icon/trolleybus.svg";
import truckSvg from "../../resources/images/icon/truck.svg";
import truckPNG from "../../resources/images/icon/truck.png";
import vanSvg from "../../resources/images/icon/van.svg";
import clusterSvg from "../../resources/images/icon/cluster.svg";
import palette from "../../common/theme/palette";

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  crane: craneSvg,
  default: defaultSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  offroad: offroadSvg,
  person: personSvg,
  pickup: pickupSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  tractor: tractorSvg,
  train: trainSvg,
  tram: tramSvg,
  trolleybus: trolleybusSvg,
  truck: truckPNG,
  van: vanSvg,
};

export const mapIconKey = (category) =>
  mapIcons.hasOwnProperty(category) ? category : "default";

export const mapImages = {};

const mapPalette = palette(null, false);

const isPng = (file) => file.endsWith(".png");

const resizeImage = (image) => {
  return new Promise((resolve) => {
    const fixedWidth = 30;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const aspectRatio = image.height / image.width;
    const width = fixedWidth;
    const height = Math.round(width * aspectRatio);

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    const resizedImage = new Image();
    resizedImage.src = canvas.toDataURL();
    resizedImage.onload = () => resolve(resizedImage);
  });
};

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  mapImages.arrow = await prepareIcon(await loadImage(arrowSvg));

  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      const iconPath = mapIcons[category];
      const results = [];

      ["info", "success", "error", "neutral", "warning"].forEach((color) => {
        results.push(
          loadImage(iconPath).then(async (icon) => {
            if (isPng(iconPath)) {
              const resizedIcon = await resizeImage(icon);
              mapImages[`${category}-${color}`] = resizedIcon;
            } else {
              mapImages[`${category}-${color}`] = prepareIcon(
                background,
                icon,
                mapPalette[color].main,
              );
            }
          }),
        );
      });

      await Promise.all(results);
    }),
  );
};
