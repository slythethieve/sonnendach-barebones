function getLayersConfigsList(lang) {
  let url =
    "https://api3.geo.admin.ch/rest/services/api/MapServer/layersConfig?lang=" +
    lang;
  return $.getJSON(url)
}

function createWMTSTileGrid(layerConfig) {
  let resolutions = layerConfig.resolutions
  let tileGrid = new ol.tilegrid.WMTS({
    origin: [420000, 350000],
    resolutions: resolutions,
    matrixIds: $.map(resolutions, function (r, i) {
      return i + ""
    }),
  })
  return tileGrid
}

function getWMTS(layer, layerConfig) {
  let tileGrid = createWMTSTileGrid(layerConfig)

  let extension = layerConfig.format || "png"
  let timestamp = layerConfig["timestamp"]
    ? layerConfig["timestamp"]
    : layerConfig["timestamps"][0]

  let WMTS = new ol.source.WMTS({
    crossOrigin: "anonymous",
    url:
      (
        "http://wmts{5-9}.geo.admin.ch/1.0.0/{Layer}/default/{Time}/21781/" +
        "{TileMatrix}/{TileRow}/{TileCol}."
      ).replace("http:", location.protocol) + extension,
    tileGrid: tileGrid,
    layer: layerConfig["serverLayerName"]
      ? layerConfig["serverLayerName"]
      : layer,
    requestEncoding: "REST",
    dimensions: {
      Time: timestamp,
    },
  })

  return WMTS
}

function createLayerTiles(layersConfig) {
  let baseLayerId = "ch.swisstopo.swissimage"
  let baseLayerConfig = layersConfig[baseLayerId]
  let baseLayer = new ol.layer.Tile({
    minResolution: baseLayerConfig.minResolution,
    maxResolution: baseLayerConfig.maxResolution,
    opacity: baseLayerConfig?.opacity,
    source: getWMTS(baseLayerId, baseLayerConfig),
  })

  let roofLayerId = "ch.bfe.solarenergie-eignung-daecher"
  let roofLayerConfig = layersConfig[roofLayerId]
  let roofLayer = new ol.layer.Tile({
    minResolution: roofLayerConfig.minResolution,
    maxResolution: roofLayerConfig.maxResolution,
    opacity: 0.65,
    source: getWMTS(roofLayerId, roofLayerConfig),
    useInterimTilesOnError: false,
  })

  return [baseLayer, roofLayer]
}

let extent = [420000, 30000, 900000, 350000]
let proj = ol.proj.get("EPSG:21781")
let view = new ol.View({
  resolutions: [650, 500, 250, 100, 50, 20, 10, 5, 2.5, 2, 1, 0.5, 0.25, 0.1],
  extent: extent,
  center: ol.extent.getCenter(extent),
  projection: proj,
  zoom: 0,
})

async function createMap(mapDivId, lang) {
  let layersConfig = await getLayersConfigsList(lang)
  let layerTiles = createLayerTiles(layersConfig)
  let interactions = ol.interaction.defaults({
    altShiftDragRotate: false,
    doubleClickZoom: false,
    dragPan: true,
    pinchRotate: false,
    pinchZoom: true,
    keyboard: false,
    mouseWheelZoom: false,
    shiftDragZoom: false,
  })

  let map = new ol.Map({
    target: mapDivId,
    layers: layerTiles,
    view: view,

    controls: ol.control.defaults({
      attributionOptions: {
        collapsible: false,
      },
    }),
    interactions: interactions,
  })
  map.addControl(new ol.control.ScaleLine())
  return map
}

function loadMapViewFromCoord(adressData) {
  if (adressData !== null) {
    view.setCenter([adressData.y_coord, adressData.x_coord])
    view.setZoom(14)
  }
}

export { createMap, loadMapViewFromCoord }
