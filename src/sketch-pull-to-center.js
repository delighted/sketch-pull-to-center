// Pull to center
//
// Sketch plugin to move selected shapes or layers toward the center of artboard.
//
// Copyright (c) 2018 Mike Gowen, Delighted

const sketch = require("sketch");

// Run handlers

export default function(context) {
  let document = sketch.fromNative(context.document);
  let selectedLayers = toArray(document.selectedLayers);

  if (!validSelection(selectedLayers)) {
    sketch.UI.message("Please select 1 or more layers that are within a single artboard.");
    return false;
  }

  let distance = sketch.UI.getStringFromUser("Distance toward center to move (pixels):", 0);
  if (distance === 0) return false;
  if (distance < 1) {
    sketch.UI.message("Please enter a positive value.");
    return false;
  }

  let artboard = layerArtboard(selectedLayers[0]);
  selectedLayers.forEach(selectedLayer => {
    moveLayerTowardArtboardCenter(selectedLayer, artboard, distance);
  });
}

// Functions

function moveLayerTowardArtboardCenter(layer, artboard, distance) {
  let run = (artboard.frame.width / 2) - (layer.frame.x + (layer.frame.width / 2));
  let rise = (artboard.frame.height / 2) - (layer.frame.y + (layer.frame.height / 2));
  let length = Math.sqrt((rise * rise) + (run * run));
  let unitX = run / length;
  let unitY = rise / length;
  distance = distance >= length ? length : distance;

  layer.frame.x = Math.round(layer.frame.x + unitX * distance);
  layer.frame.y = Math.round(layer.frame.y + unitY * distance);
}

function validSelection(selectedLayers) {
  if (selectedLayers.length < 0) {
    return false;
  }
  if (hasArtboardSelected(selectedLayers)) return false;
  let selectedLayerArtboards = layersArtboards(selectedLayers);
  if (hasOrphanLayerSelected(selectedLayerArtboards)) return false;
  if (totalSelectionArtboardCount(selectedLayerArtboards) !== 1) return false;
  return true;
}

function totalSelectionArtboardCount(selectedLayerArtboards) {
  let selectedLayerArtboardIds = selectedLayerArtboards.map(selectedLayerArtboard => selectedLayerArtboard.id);
  return Array.from(new Set(selectedLayerArtboardIds)).length;
}

function hasOrphanLayerSelected(layerArtboards) {
  return layerArtboards.some(layerArtboard => layerArtboard === undefined);
}

function hasArtboardSelected(selectedLayers) {
  return selectedLayers.some(selectedLayer => selectedLayer.type === String(sketch.Types.Artboard));
}

function layersArtboards(layers) {
  return layers.map(layer => layerArtboard(layer));
}

function layerArtboard(layer) {
  if (layer.parent.type === String(sketch.Types.Artboard)) {
    return layer.parent;
  } else if (layer.parent.type === String(sketch.Types.Page)) {
    return undefined;
  } else {
    return layerArtboard(layer.parent);
  }
}

function toArray(nsArray) {
  return nsArray.map(el => el);
}
