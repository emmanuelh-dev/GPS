import { useId, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/styles";
import { map } from "./core/MapView";
import {
  formatSpeed,
  formatTime,
  getStatusColor,
} from "../common/util/formatter";
import { mapIconKey } from "./core/preloadImages";
import { findFonts } from "./core/mapUtil";
import {
  useAttributePreference,
  usePreference,
} from "../common/util/preferences";
import { speedToKnots } from "../common/util/converter";
import { useTranslation } from "../common/components/LocalizationProvider";

const MapPositions = ({
  positions,
  onClick,
  showStatus,
  selectedPosition,
  titleField,
  filterOnChange,
  setCurrentDevices,
  currentDevices,
}) => {
  const id = useId();
  const clusters = `${id}-clusters`;
  const selected = `${id}-selected`;

  const textSize = 15;

  const t = useTranslation();

  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const iconScale = useAttributePreference("iconScale", desktop ? 0.75 : 1.7);

  const devices = useSelector((state) => state.devices.items);
  const selectedDeviceId = useSelector((state) => state.devices.selectedId);

  const mapCluster = useAttributePreference("mapCluster", true);
  const hours12 = usePreference("twelveHourFormat");
  const directionType = useAttributePreference("mapDirection", "selected");

  const tooltip = document.createElement("div");
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "white";
  tooltip.style.color = "black";
  tooltip.style.fontSize = "12px";
  tooltip.style.padding = "5px";
  tooltip.style.borderRadius = "5px";
  tooltip.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  tooltip.style.display = "none";
  document.body.appendChild(tooltip);
  const speedUnit = useAttributePreference("speedUnit");

  async function getVisibleFeatures(e) {
    if (!filterOnChange) return;

    const allVisibleDevices = new Map();

    try {
      // Process individual markers
      if (map.getLayer(id) && map.getLayer(selected)) {
        const markers = map.queryRenderedFeatures(e, {
          layers: [id, selected],
        });

        markers.forEach((marker) => {
          const { deviceId, name, speed, temperature } = marker.properties;
          if (!allVisibleDevices.has(deviceId)) {
            allVisibleDevices.set(deviceId, {
              deviceId,
              name,
              speed,
              temperature,
            });
          }
        });
      }

      // Process clusters
      if (map.getLayer(clusters)) {
        const clusterFeatures = map.queryRenderedFeatures(e, {
          layers: [clusters],
        });

        for (const cluster of clusterFeatures) {
          const clusterId = cluster.properties.cluster_id;
          const leaves = await getClusterLeavesAsync(clusterId);

          leaves.forEach((leaf) => {
            const { deviceId, name, speed, temperature } = leaf.properties;
            if (!allVisibleDevices.has(deviceId)) {
              allVisibleDevices.set(deviceId, {
                deviceId,
                name,
                speed,
                temperature,
              });
            }
          });
        }
      }

      const visibleDevices = Array.from(allVisibleDevices.values()).sort(
        (a, b) => a.deviceId - b.deviceId
      );

      setCurrentDevices(
        visibleDevices.map((device) => devices[device.deviceId])
      );
    } catch (error) {
      console.warn("Error querying map features:", error);
    }
  }

  // Helper function to handle async cluster leaves
  function getClusterLeavesAsync(clusterId) {
    return new Promise((resolve, reject) => {
      map.getSource(id).getClusterLeaves(clusterId, 100, 0, (error, leaves) => {
        if (error) {
          reject(error);
        } else {
          resolve(leaves);
        }
      });
    });
  }

  // map.on("zoomend", (e) => {
  //   getVisibleFeatures(e);
  // });
  map.on("moveend", (e) => {
    getVisibleFeatures(e);
  });

  const createFeature = (devices, position, selectedPositionId) => {
    const device = devices[position.deviceId];
    let showDirection;
    switch (directionType) {
      case "none":
        showDirection = false;
        break;
      case "all":
        showDirection = true;
        break;
      default:
        showDirection = selectedPositionId === position.id;
        break;
    }
    return {
      id: position.id,
      deviceId: position.deviceId,
      name: device.name,
      fixTime: formatTime(position.fixTime, "seconds", hours12),
      category: mapIconKey(device.category),
      color: getStatusColor({
        status: device.status,
        speed: position?.speed,
        termo: position?.attributes.hasOwnProperty("bleTemp1"),
        ignition: position?.attributes?.ignition,
      }),
      rotation: device.category ? position.course : 0,
      direction: showDirection,
      speed: (position?.speed * 1.852).toFixed(2),
      temperature: position?.attributes?.bleTemp1,
    };
  };

  const onMouseEnter = () => (map.getCanvas().style.cursor = "pointer");
  const onMouseLeave = () => (map.getCanvas().style.cursor = "");

  const onMouseOver = (event) => {
    if (desktop) {
      map.getCanvas().style.cursor = "pointer";
      const feature = event.features[0];
      let tooltipContent = `${feature.properties.speed} km/h`;
      if (feature.properties.temperature) {
        tooltipContent += `<br/>${Math.round(
          feature.properties.temperature
        )}° / ${Math.round(
          Math.round(feature.properties.temperature) * (9 / 5) + 32
        )}°`;
      }
      tooltip.innerHTML = tooltipContent;
      tooltip.style.display = "block";
    }
  };

  const onMouseOverClusters = (event) => {
    if (desktop) {
      map.getCanvas().style.cursor = "pointer";

      const features = map.queryRenderedFeatures(event.point, {
        layers: [clusters],
      });
      const clusterId = features[0].properties.cluster_id;

      map.getSource(id).getClusterLeaves(clusterId, 100, 0, (error, leaves) => {
        if (error) {
          console.error(error);
          return;
        }

        const devices = leaves
          .map((leaf) => {
            const { name, speed, temperature } = leaf.properties;
            let deviceInfo = `<strong>${name}:</strong> ${speed} km/h`;
            if (temperature) {
              deviceInfo += ` ${Math.round(temperature)}°C / ${Math.round(
                Math.round(temperature) * (9 / 5) + 32
              )}°F`;
            }
            return deviceInfo;
          })
          .join("<br/>");

        tooltip.innerHTML = `${devices}<br/>`;
        tooltip.style.display = "block";
      });
    }
  };

  const onMouseMove = (event) => {
    const { x, y } = event.point;
    tooltip.style.left = `${x + 15}px`;
    tooltip.style.top = `${y + 15}px`;
  };

  const onMouseOut = () => {
    map.getCanvas().style.cursor = "";
    tooltip.style.display = "none";
  };

  const onMapClick = useCallback(
    (event) => {
      if (!event.defaultPrevented && onClick) {
        onClick();
      }
    },
    [onClick]
  );

  const onMarkerClick = useCallback(
    (event) => {
      event.preventDefault();
      const feature = event.features[0];
      if (onClick) {
        onClick(feature.properties.id, feature.properties.deviceId);

        const { coordinates } = feature.geometry;

        map.easeTo({
          center: coordinates,
          zoom: 18,
        });
      }
    },
    [onClick]
  );

  const onClusterClick = useCallback(
    (event) => {
      event.preventDefault();
      const features = map.queryRenderedFeatures(event.point, {
        layers: [clusters],
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource(id).getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (!error) {
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom,
          });
        }
      });
    },
    [clusters]
  );

  useEffect(() => {
    map.addSource(id, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
      cluster: mapCluster,
      clusterMaxZoom: 14,
      clusterRadius: 45,
    });
    map.addSource(selected, {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    [id, selected].forEach((source) => {
      map.addLayer({
        id: source,
        type: "symbol",
        source,
        filter: ["!has", "point_count"],
        layout: {
          "icon-image": "{category}-{color}",
          "icon-rotate": ["get", "rotation"],
          "icon-rotation-alignment": "map",
          "icon-size": iconScale,
          "icon-allow-overlap": true,
          "text-field": `{${titleField || "name"}}`,
          "text-allow-overlap": true,
          "text-anchor": "bottom",
          "text-offset": [0, -1.5],
          "text-font": findFonts(map),
          "text-size": textSize,
        },
        paint: {
          "text-halo-color": "white",
          "text-halo-width": 1,
        },
      });
      // This show the direccion in the map

      // map.addLayer({
      //   id: `direction-${source}`,
      //   type: 'symbol',
      //   source,
      //   filter: [
      //     'all',
      //     ['!has', 'point_count'],
      //     ['==', 'direction', true],
      //   ],
      //   layout: {
      //     'icon-image': 'direction',
      //     'icon-size': iconScale,
      //     'icon-allow-overlap': true,
      //     'icon-rotate': ['get', 'rotation'],
      //     'icon-rotation-alignment': 'map',
      //   },
      // });
      map.on("mouseenter", source, onMouseEnter);
      map.on("mouseover", source, onMouseOver);
      map.on("mousemove", source, onMouseMove);
      map.on("mouseout", source, onMouseOut);
      map.on("mouseleave", source, onMouseLeave);
      map.on("click", source, onMarkerClick);
    });
    map.addLayer({
      id: clusters,
      type: "symbol",
      source: id,
      filter: ["has", "point_count"],
      layout: {
        "icon-image": "default-neutral",
        "icon-size": iconScale,
        "text-field": "{point_count_abbreviated}",
        "text-font": findFonts(map),
        "text-offset": [0, -1.5],
        "text-size": textSize,
        "text-anchor": "bottom",
        "icon-rotate": ["get", "rotation"],
      },
    });

    map.on("mouseenter", clusters, onMouseEnter);
    map.on("mouseovere", clusters, onMouseOver);
    map.on("mouseleave", clusters, onMouseLeave);
    map.on("mouseover", clusters, onMouseOverClusters);
    map.on("mousemove", clusters, onMouseMove);
    map.on("mouseout", clusters, onMouseOut);
    map.on("click", clusters, onClusterClick);
    map.on("click", onMapClick);

    return () => {
      map.off("mouseenter", clusters, onMouseEnter);
      map.on("mouseovere", clusters, onMouseOver);
      map.off("mouseleave", clusters, onMouseLeave);
      map.off("click", clusters, onClusterClick);
      map.off("click", onMapClick);

      if (map.getLayer(clusters)) {
        map.removeLayer(clusters);
      }

      [id, selected].forEach((source) => {
        map.off("mouseenter", source, onMouseEnter);
        map.off("mouseleave", source, onMouseLeave);
        map.on("mouseovere", clusters, onMouseOver);
        map.off("click", source, onMarkerClick);

        if (map.getLayer(source)) {
          map.removeLayer(source);
        }
        if (map.getLayer(`direction-${source}`)) {
          map.removeLayer(`direction-${source}`);
        }
        if (map.getSource(source)) {
          map.removeSource(source);
        }
      });
    };
  }, [mapCluster, clusters, onMarkerClick, onClusterClick]);

  useEffect(() => {
    [id, selected].forEach((source) => {
      map.getSource(source)?.setData({
        type: "FeatureCollection",
        features: positions
          .filter((it) => devices.hasOwnProperty(it.deviceId))
          .filter((it) =>
            source === id
              ? it.deviceId !== selectedDeviceId
              : it.deviceId === selectedDeviceId
          )
          .map((position) => ({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [position.longitude, position.latitude],
            },
            properties: createFeature(
              devices,
              position,
              selectedPosition && selectedPosition.id
            ),
          })),
      });
    });
  }, [
    mapCluster,
    clusters,
    onMarkerClick,
    onClusterClick,
    devices,
    positions,
    selectedPosition,
  ]);

  return null;
};

export default MapPositions;
