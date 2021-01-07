import React, { useEffect } from 'react';
import * as Cesium from 'cesium';

import 'cesium/Build/Cesium/Widgets/widgets.css';

window.CESIUM_BASE_URL = '/';
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyYTM0NGM5MS03MWI5LTRiZmQtODEwYS1jNjUxMTNiODE1ZTciLCJpZCI6NDEzMzUsImlhdCI6MTYxMDAwMjQyMH0.PV1jEaRueFu1lw_rUxvPCfBJ7BjWFuIxZiKl8u69vV0';

const Map = () => {
  let newBuildingTileset;
  let viewer;

  useEffect(() => {
    viewer = new Cesium.Viewer('cesiumContainer', {
      terrainProvider: Cesium.createWorldTerrain()
    });

    // Add Cesium OSM Buildings.
    const buildingsTileset = viewer.scene.primitives.add(Cesium.createOsmBuildings());

    // Fly the camera to Denver, Colorado at the given longitude, latitude, and height.
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(-104.9965, 39.74248, 4000)
    });

    addBuildingGeoJSON();

    buildingsTileset.style = new Cesium.Cesium3DTileStyle({
      // Create a style rule to control each building's "show" property.
      show: {
        conditions : [
          // Any building that has this elementId will have `show = false`.
          ['${elementId} === 332469316', false],
          ['${elementId} === 332469317', false],
          ['${elementId} === 235368665', false],
          ['${elementId} === 530288180', false],
          ['${elementId} === 4213870', false],
          // If a building does not have one of these elementIds, set `show = true`.
          [true, true]
        ]
      },
      // Set the default color style for this particular 3D Tileset.
      // For any building that has a `cesium#color` property, use that color, otherwise make it white.
      color: "Boolean(${feature['cesium#color']}) ? color(${feature['cesium#color']}) : color('#ffffff')"
    });

    newBuildingTileset = viewer.scene.primitives.add(
      new Cesium.Cesium3DTileset({
        url: Cesium.IonResource.fromAssetId(246281)
      })
    );
    // Move the camera to the new building.
    viewer.flyTo(newBuildingTileset);
  }, []);

  async function addBuildingGeoJSON() {
    // Load the GeoJSON file from Cesium ion.
    const geoJSONURL = await Cesium.IonResource.fromAssetId('246267');
    // Create the geometry from the GeoJSON, and clamp it to the ground.
    const geoJSON = await Cesium.GeoJsonDataSource.load(geoJSONURL, { clampToGround: true });
    // Add it to the scene.
    const dataSource = await viewer.dataSources.add(geoJSON);
    // By default, polygons in CesiumJS will be draped over all 3D content in the scene.
    // Modify the polygons so that this draping only applies to the terrain, not 3D buildings.
    for (const entity of dataSource.entities.values) {
      entity.polygon.classificationType = Cesium.ClassificationType.TERRAIN;
    }
    // Move the camera so that the polygon is in view.
    viewer.flyTo(dataSource);
  };

  const toggleBuilding = () => {
    newBuildingTileset.show = !newBuildingTileset.show;
  };

  return (
    <>
      <div id='cesiumContainer' />
      <button id="toggle-building" onClick={toggleBuilding}>Toggle new building</button>
    </>
  );
};

export default Map;
