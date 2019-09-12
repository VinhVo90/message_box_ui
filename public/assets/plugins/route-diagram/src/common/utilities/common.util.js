import * as d3 from 'd3';
import _ from 'lodash';
const yarml = require('../../../assets/lib/yaml/js-yaml.min');

import {
  COMMON_DATA,
  AUTO_SCROLL_CONFIG,
  DEFAULT_CONFIG_GRAPH,
  VIEW_MODE,
  LINE_STYLE,
} from '../const/index';


/**
 * Read file format JSON and return
 * @param file
 * @returns {Promise}
 */
export function readDataFileJson(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const data = JSON.parse(fileReader.result);
        resolve(data);
        // resolve(fileReader.result);
      } catch (ex) {
        comShowMessage(`Read file error!\n${ex.message}`);
      }
    };

    if (file) { fileReader.readAsText(file); }
  });
}

/**
 * Read text file
 * @param file
 * @returns {Promise}
 */
export function readYamlFile(file) {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        const configData = yarml.safeLoad(fileReader.result);
        resolve(configData);
      } catch (ex) {
        comShowMessage(`Read file error!\n${ex.message}`);
      }
    };

    if (file) { fileReader.readAsText(file); }
  });
}

/**
 * Show message alert
 * @param msg
 */
export function comShowMessage(msg = null) {
  if (!msg) { return; }
  alert(msg);
}

/**
 * Get coordinate mouse when click on SVG
 * relation to parent
 * @param e
 * @param parent
 * @returns {{x: number, y: number}}
 */
export function getCoorMouseClickRelativeToParent(e, parent) {
  const container = $(`${parent}`);
  const x = Math.round(e.clientX + container.scrollLeft() - container.offset().left);
  const y = Math.round(e.clientY + container.scrollTop() - container.offset().top);
  return { x, y };
}

/**
 * Init id for object
 * @param type
 */
export function generateObjectId(type) {
  sleep(1);// Prevent duplicate Id
  const date = new Date();
  return `${type}${date.getTime()}`;
}

export function checkIsMatchRegexNumber(val) {
  const regex = new RegExp('^(?=.)([+-]?([0-9]*)(\.([0-9]+))?)$');
  return regex.test(val);
}

/**
 * Allow only numeric (0-9) in HTML inputbox using jQuery.
 * Allow: backspace, delete, tab, escape, enter and .
 * Allow: Ctrl+A, Command+A
 */
export function allowInputNumberOnly(e) {
  // Allow: backspace, delete, tab, escape, enter, dot(.) and +
  if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190, 187, 189]) !== -1
    // Allow: Ctrl+A, Command+A
    || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true))
    // Allow: home, end, left, right, down, up
    || (e.keyCode >= 35 && e.keyCode <= 40)) {
    // let it happen, don't do anything
    return;
  }
  // Ensure that it is a number and stop the key press
  if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault();
  }
}

export function checkMinMaxValue(val, min = 0, max = 9999) {
  if (parseInt(val) < min || isNaN(parseInt(val))) { return min; }
  if (parseInt(val) > max) { return max; }
  return parseInt(val);
}

/**
 * Remove special character in selector query
 * @param id
 * @returns {string}
 */
export function replaceSpecialCharacter(id) {
  return id.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, '\\$&');
}

export function createPath(src, des, type = LINE_STYLE.STRAIGHT, useMarker = false, lineWidth = 1) {
  if (type === LINE_STYLE.STRAIGHT) {
    return createStraightPath(src, des, useMarker, lineWidth);
  } else if (type == LINE_STYLE.POLYLINES) {
    return createPolylinesPath(src, des, useMarker, lineWidth);
  }
}

export function createStraightPath(src, des, useMarker, lineWidth) {
  if (useMarker === 'Y') {
    let A = distanceBetweenTwoPointOnTheSameLine({x: des.x, y: des.y}, {x: src.x, y: src.y}, {x: des.x, y: des.y}, lineWidth);
    return `M${src.x},${src.y} L${A.x},${A.y}`;
  } else {
    return `M${src.x},${src.y} L${des.x},${des.y}`;
  }
}

export function createPolylinesPath(src, des, useMarker, lineWidth) {
  const minSpace = 5;
  const minSpace2 = 20;
  const fileNameBarHeight = 20;

  if (src.x <= des.x - minSpace*2) {
    if (src.y == des.y) {
      return createStraightPath(src, des, useMarker, lineWidth);
    } else {
      const midX = src.x + ((des.x - src.x) / 2); // middle between 2 object
      if (useMarker === 'Y') {
        return `M${src.x},${src.y} L${midX},${src.y} L${midX},${des.y} L${des.x - lineWidth},${des.y}`;
      } else {
        return `M${src.x},${src.y} L${midX},${src.y} L${midX},${des.y} L${des.x},${des.y}`;
      }
    }
  } else {
    const srcRect = $(`#${src.vertexId}`)[0].getBoundingClientRect();
    const desRect = $(`#${des.vertexId}`)[0].getBoundingClientRect();
    const srcBottom = src.y + srcRect.height;
    const desBottom = des.y + desRect.height;
    
    let midY;
    if (src.y < des.y) {
      midY = srcBottom + ((des.y - srcBottom) / 2) - fileNameBarHeight;
    } else {
      midY = desBottom + ((src.y - desRect.bottom) / 2) - fileNameBarHeight;
    }

    if (useMarker === 'Y') {
      return `M${src.x},${src.y} L${src.x + minSpace2},${src.y} L${src.x + minSpace2},${midY} L${des.x - minSpace2},${midY} L${des.x - minSpace2},${des.y} L${des.x - lineWidth},${des.y}`;
    } else {
      return `M${src.x},${src.y} L${src.x + minSpace2},${src.y} L${src.x + minSpace2},${midY} L${des.x - minSpace2},${midY} L${des.x - minSpace2},${des.y} L${des.x},${des.y}`;
    }
  }
}

// move element in array
export function arrayMove(x, from, to) {
  x.splice((to < 0 ? x.length + to : to), 0, x.splice(from, 1)[0]);
}

export function setSizeGraph(options, svgId) {
  const offer = 200;
  const { width, height } = options;

  if (width) {
    COMMON_DATA.currentWidth = width + offer;
    $(`#${svgId}`).css('min-width', COMMON_DATA.currentWidth);
  }

  if (height) {
    COMMON_DATA.currentHeight = height + offer;
    $(`#${svgId}`).css('min-height', COMMON_DATA.currentHeight);
  }
}

export function sleep(millis) {
  const date = new Date();
  let curDate = null;
  do { curDate = new Date(); }
  while (curDate - date < millis);
}

/**
 * Shink graph when object drag end.
 * @param {*} data
 * @param {*} svgId
 */
export function setMinBoundaryGraph(data, svgId, viewMode) {
  // Array store size
  const lstOffsetX = [DEFAULT_CONFIG_GRAPH.MIN_WIDTH];
  const lstOffsetY = [DEFAULT_CONFIG_GRAPH.MIN_HEIGHT];

  // Filter boundary without parent
  const boundaries = _.filter(data.boundary, g => g.parent == null);

  // Filter vertex without parent
  const vertices = _.filter(data.vertex, g => g.parent == null);


  boundaries.forEach((e) => {
    const node = d3.select(`#${e.id}`).node();
    if (node) {
      const { width, height } = node.getBBox();
      lstOffsetX.push(width + e.x);
      lstOffsetY.push(height + e.y);
    }
  });

  vertices.forEach((e) => {
    const node = d3.select(`#${e.id}`).node();
    if (node) {
      const { width, height } = node.getBBox();
      lstOffsetX.push(width + e.x);
      lstOffsetY.push(height + e.y);
    }
  });

  // Get max width, max height
  const width = Math.max.apply(null, lstOffsetX);
  const height = Math.max.apply(null, lstOffsetY);

  if (checkModePermission(viewMode, 'horizontalScroll')) {
    setSizeGraph({ width, height }, svgId);
  } else {
    setSizeGraph({ width: undefined, height }, svgId);
  }
}

/**
 * Auto scroll when drag vertex or boundary
 */
export function autoScrollOnMousedrag(svgId, containerId, viewMode) {
  // Auto scroll on mouse drag
  const svg = d3.select(`#${svgId}`).node();
  const $parent = $(`#${containerId}`);

  const h = $parent.height();
  const sT = $parent.scrollTop();

  const w = $parent.width();
  const sL = $parent.scrollLeft();

  const coordinates = d3.mouse(svg);
  const x = coordinates[0];
  const y = coordinates[1];

  if ((y + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) > h + sT) {
    $parent.scrollTop((y + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) - h);
  } else if (y < AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL + sT) {
    $parent.scrollTop(y - AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL);
  }

  if (checkModePermission(viewMode, 'horizontalScroll')) {
    if ((x + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) > w + sL) {
      $parent.scrollLeft((x + AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL) - w);
    } else if (x < AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL + sL) {
      $parent.scrollLeft(x - AUTO_SCROLL_CONFIG.LIMIT_TO_SCROLL);
    }
  }
}

export function updateSizeGraph(dragObj) {
  const { width, height } = d3.select(`#${dragObj.id}`).node().getBBox();
  const currentX = d3.mouse(d3.select(`#${dragObj.svgId}`).node())[0]; //d3.event.x;
  const currentY = d3.mouse(d3.select(`#${dragObj.svgId}`).node())[1]; //d3.event.y;
  const margin = 100;

  if (checkModePermission(dragObj.viewMode.value, 'horizontalScroll')) {
    if ((currentX + width) > COMMON_DATA.currentWidth) {
      COMMON_DATA.currentWidth = currentX + width + margin;
      $(`#${dragObj.svgId}`).css('min-width', COMMON_DATA.currentWidth);
    }
  }

  if ((currentY + height) > COMMON_DATA.currentHeight) {
    COMMON_DATA.currentHeight = currentY + height + margin;
    $(`#${dragObj.svgId}`).css('min-height', COMMON_DATA.currentHeight);
  }
}

/**
 * Check with type is allowed in viewMode
 * @param {*} viewMode
 * @param {*} type
 */
export function checkModePermission(viewMode, type) {
  const data = {};

  data[VIEW_MODE.SHOW_ONLY] = [
    'showReduced',
    'editVertex', 'isEnableDragVertex', 'vertexRepeat',
    'editBoundary', 'isEnableDragBoundary', 'isEnableItemVisibleMenu', 'maxBoundaryRepeat',
    'nameSuffix', 'horizontalScroll', 'mandatoryCheck', 'headerConnector', 'bodyConnector'
  ];

  data[VIEW_MODE.EDIT] = [
    'createVertex', 'createBoundary', 'clearAll', 'showReduced',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex', 'vertexRepeat',
    'editBoundary', 'removeBoundary', 'copyAllBoundary', 'deleteAllBoundary', 'boundaryBtnConfirm', 'isEnableDragBoundary', 'isEnableItemVisibleMenu', 'maxBoundaryRepeat',
    'nameSuffix', 'horizontalScroll', 'mandatoryCheck', 'headerConnector', 'bodyConnector',
    'deleteEdge'
  ];

  data[VIEW_MODE.OPERATIONS] = [
    'createVertex', 'createBoundary', 'clearAll',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex',
    'editBoundary', 'removeBoundary', 'copyAllBoundary', 'deleteAllBoundary', 'boundaryBtnConfirm', 'isEnableDragBoundary', 'isEnableItemVisibleMenu',
    'horizontalScroll', 'autoAlignment', 'history', 'mandatoryCheck', 'headerConnector', 'bodyConnector'
  ];

  data[VIEW_MODE.INPUT_MESSAGE] = [
    'showReduced',
    'editVertex', 'vertexRepeat',
    'editBoundary', 'maxBoundaryRepeat', 'isEnableItemVisibleMenu',
    'nameSuffix', 'headerConnector', 'bodyConnector'
  ];

  data[VIEW_MODE.OUTPUT_MESSAGE] = [
    'showReduced',
    'editVertex', 'vertexRepeat',
    'editBoundary', 'maxBoundaryRepeat', 'isEnableItemVisibleMenu',
    'nameSuffix', 'mandatoryCheck', 'headerConnector', 'bodyConnector'
  ];

  data[VIEW_MODE.SEGMENT] = [
    'createNew', 'find', 'showReduced',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex',
    'horizontalScroll', 'mandatoryCheck',
  ];

  data[VIEW_MODE.ROUTE_DIAGRAM] = [
    'clearAll', 'showReduced',
    'editVertex', 'copyVertex', 'removeVertex', 'vertexBtnConfirm', 'vertexBtnAdd', 'vertexBtnDelete', 'isEnableDragVertex',
    'boundaryBtnConfirm', 'isEnableDragBoundary', 'isEnableItemVisibleMenu',
    'horizontalScroll', 'autoAlignment', 'mandatoryCheck', 'headerConnector',
    'editLineStyle'
  ];

  return data[viewMode].indexOf(type) !== -1;
}

/**
 * get prefix for key of data-element Vertex
 * @param {*} dataElement
 * @param {*} vertexDefinition
 * @param {*} groupType
 */
export function getKeyPrefix(dataElement, vertexDefinition, groupType) {
  const keyPrefix = _.find(vertexDefinition.vertexGroup, { groupType }).vertexPresentation.keyPrefix;
  if (!keyPrefix) return '';

  let res = '';
  for (const propName in keyPrefix) {
    if (dataElement[propName]) {
      res += keyPrefix[propName][dataElement[propName]] ? keyPrefix[propName][dataElement[propName]] : '';
    }
  }

  return res;
}

export function htmlEncode(s) {
  const translate = {
    ' ': '&nbsp;',
    '&': '&amp;',
    '\\': '&quot;',
    '<': '&lt;',
    '>': '&gt;',
  };

  let res = '';
  s.split('').forEach((e) => {
    if (translate[e]) {
      res += translate[e];
    } else {
      res += e;
    }
  });

  return res;
}

export function segmentName(segmentObject, viewMode) {
  if (checkModePermission(viewMode, 'nameSuffix')) {
    const usage = segmentObject.mandatory ? 'M' : 'C';
    return `${segmentObject.name} [${usage}${segmentObject.repeat}]`;
  }
  return `${segmentObject.name}`;
}

export function setAddressTabName(tabId, fileName) {
  $(`#${tabId}`).show();
  $(`#${tabId}`).text(`< ${fileName} >`);
  $(`#${tabId}`).attr('title', fileName);
}

export function unsetAddressTabName(tabId) {
  $(`#${tabId}`).text('');
  $(`#${tabId}`).attr('title', '');
  $(`#${tabId}`).hide();
}

/**
 * Enable dragging for popup
 */
export function initDialogDragEvent(dialogId) {
  $(`#${dialogId} .dialog-title`).css('cursor', 'move').on('mousedown', (e) => {
    const $drag = $(`#${dialogId} .modal-dialog`).addClass('draggable');
    const pos_y = $drag.offset().top - e.pageY;
    const pos_x = $drag.offset().left - e.pageX;
    const winH = window.innerHeight;
    const winW = window.innerWidth;
    const dlgW = $drag.get(0).getBoundingClientRect().width;

    $(window).on('mousemove', (e) => {
      let x = e.pageX + pos_x;
      let y = e.pageY + pos_y;

      if (x < 10) x = 10;
      else if (x + dlgW > winW - 10) x = winW - dlgW - 10;

      if (y < 10) y = 10;
      else if (y > winH - 10) y = winH - 10;

      $(`#${dialogId} .draggable`).offset({
        top: y,
        left: x,
      });
    });

    e.preventDefault(); // disable selection
  });

  $(window).on('mouseup', (e) => {
    $(`#${dialogId} .draggable`).removeClass('draggable');
  });
}

export function hideFileChooser() {
  if ($('.container.file-mgmt').css('display') === 'block') {
    $('.container.file-mgmt').slideToggle();
  }
}

export function filterPropertyData(data, options = [], excludeOptions = []) {
  const result = [];

  if (options && options.length > 0) {
    data.forEach((e) => {
      const obj = {};
      for (const propName in e) {
        if (options.indexOf(propName) !== -1) {
          obj[propName] = typeof (e[propName]) === 'object' ? _.clone(e[propName]) : e[propName];
        }
      }

      result.push(obj);
    });
  } else if (excludeOptions && excludeOptions.length > 0) {
    data.forEach((e) => {
      const obj = {};
      for (const propName in e) {
        if (excludeOptions.indexOf(propName) === -1) {
          obj[propName] = typeof (e[propName]) === 'object' ? _.clone(e[propName]) : e[propName];
        }
      }

      result.push(obj);
    });
  }

  return result;
}

/**
 * Check if any popup or menu context is opening
 */
export function isPopupOpen() {
  return $('.modal-backdrop').length >= 1 || $('#context-menu-layer').length >= 1;
}

/**
 * Check key of source and target is match
 * @param src
 * @param tgt
 * @returns {boolean}
 */
export function checkKeyMisMatch(src, tgt) {
  let misMatch = false;
  
  for (let i = 0; i < src.length; i += 1) {
    let key = src[i];
    if (tgt.indexOf(key) < 0) {
      misMatch = true;
    }
  }

  return misMatch;
}

/**
 * Check length of source and target is match
 * @param src
 * @param tgt
 * @returns {boolean}
 */
export function checkLengthMisMatch(src, tgt) {
  return src.length != tgt.length ? true : false;
}

/**
 * Removing Duplicate Objects From An Array By Property
 * @param myArr
 * @param prop
 * @author: Dwayne
 * @reference: https://ilikekillnerds.com/2016/05/removing-duplicate-objects-array-property-name-javascript/
 */
export function removeDuplicates(myArr, prop) {
  return myArr.filter((obj, pos, arr) => {
    return arr.map(mapObj => mapObj[prop]).indexOf(obj[prop]) === pos;
  })
}

/**
   * Get bbox object match with selector
   * @param selector
   * @returns {*}
   */
export function getBBoxObject(selector) {
  const node = d3.select(`${selector}`);
  if (node)
    return node.node().getBBox();
    
  return null;
}

export function quadratic(a, b, c) {
  /**
   * aX^2 + bX + c = 0 (a != 0)
   * deltal = b^2 - 4ac
   * delta < 0 => the equation has no solution
   * delta == 0 => X1 = X2 = -b/2a
   * delta > 0 => 
   * X1 = (-b + sqrt(delta))/2a
   * X2 = (-b - sqrt(delta))/2a
   * 
   * Special:
   * a + b + c = 0 => X1 = 1; X2 = c/a
   * a - b + c = => X1 = -1; X2 = -c/a
   */

  let X1, X2, delta;

  if (a === 0) {
    X1 = X2 = -c/b;

    return {X1, X2};
  }

  // Speccial case
  if (a + b + c === 0) {
    X1 = 1;
    X2 = c / a;

    return {X1, X2};
  } else if (a - b + c === 0) {
    X1 = -1;
    X2 = -c / a;

    return {X1, X2};
  }

  // Normal case
  delta = b*b - 4*a*c;

  if (delta < 0) return {X1: null, x2: null};

  if (delta === 0) {
    X1 = X2 = -b / (2*a)
  } else {
    X1 = (-b + Math.sqrt(delta)) / (2*a);
    X2 = (-b - Math.sqrt(delta)) / (2*a);
  }

  return {X1, X2};
}

/**
 * calculate the distance from param0 and on the line making by param1 and param2
 * @param {*} param0 distance from this point
 * @param {*} param1 one of two point for making line
 * @param {*} param2 one of two point for making line
 * @param {*} distance the distance need to be calculated from param0
 */
export function distanceBetweenTwoPointOnTheSameLine({x, y}, {x: Ax, y: Ay}, {x: Bx, y: By}, distance) {
  /**
   * y = ax + b
   * (AB) line:
   * a = (By - Ay) / (Bx - Ax)
   * b = (AyBx - ByAx) / (Bx - Ax)
   * 
   * M(x1, y1), N(x2, y2)
   * MN = sqrt((x2-x1)^2 + (y2 - y1)^2)
   * MN = distance => sqrt((x2-x1)^2 + (y2 - y1)^2) = distance
   * <=> (x2-x1)^2 + (y2 - y1)^2 = distance^2
   */

  // y = ax + b
  let a, b, X1, X2, Y1, Y2;

  if (Ax === Bx) {
    /* (AB) // Oy */
    X1 = X2 = Ax;
    Y1 = y + distance;
    Y2 = y - distance;
  } else if (Ay === By) {
    /* (AB) // Ox */
    Y1 = Y2 = y;
    X1 = x + distance;
    X2 = x - distance;
  } else {
    a = (By - Ay) / (Bx - Ax);
    b = (Ay*Bx - By*Ax) / (Bx - Ax);

    // Ax^2 + Bx + C = 0
    let A, B, C;
    A = 1 + a*a;
    B = -2*x + 2*a*b - 2*a*y;
    C = -2*b*y + x*x + b*b + y*y - distance*distance;

    const quadraticResult = quadratic(A, B, C);

    if (quadraticResult.X1 === null) {
      return null;
    }

    X1 = quadraticResult.X1;
    X2 = quadraticResult.X2;

    Y1 = a*X1 + b;
    Y2 = a*X2 + b;
  }

  if (Ax < Bx) {
    if (X1 >= Ax && X1 <= Bx) return {x: X1, y: Y1};
    if (X2 >= Ax && X2 <= Bx) return {x: X2, y: Y2};
  } else if (Ax > Bx) {
    if (X1 >= Bx && X1 <= Ax) return {x: X1, y: Y1};
    if (X2 >= Bx && X2 <= Ax) return {x: X2, y: Y2};
  } else {
    // Ax === Bx
    if (Ay < By) {
      if (Y1 >= Ay && Y1 <= By) return {x: X1, y: Y1};
      if (Y2 >= Ay && Y2 <= By) return {x: X2, y: Y2};
    } else if (Ay > By) {
      if (Y1 >= By && Y1 <= Ay) return {x: X1, y: Y1};
      if (Y2 >= By && Y2 <= Ay) return {x: X2, y: Y2};
    }
  }
}

export function copyToClipboard(text) {
  let $temp = $("<textarea>");
  $("body").append($temp);
  $temp.val(text).select();
  document.execCommand("copy");
  $temp.remove();
}

export function textWidth(str, fontSize = 10) {
  const widths = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0.2796875,0.2765625,0.3546875,0.5546875,0.5546875,0.8890625,0.665625,0.190625,0.3328125,0.3328125,0.3890625,0.5828125,0.2765625,0.3328125,0.2765625,0.3015625,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.5546875,0.2765625,0.2765625,0.584375,0.5828125,0.584375,0.5546875,1.0140625,0.665625,0.665625,0.721875,0.721875,0.665625,0.609375,0.7765625,0.721875,0.2765625,0.5,0.665625,0.5546875,0.8328125,0.721875,0.7765625,0.665625,0.7765625,0.721875,0.665625,0.609375,0.721875,0.665625,0.94375,0.665625,0.665625,0.609375,0.2765625,0.3546875,0.2765625,0.4765625,0.5546875,0.3328125,0.5546875,0.5546875,0.5,0.5546875,0.5546875,0.2765625,0.5546875,0.5546875,0.221875,0.240625,0.5,0.221875,0.8328125,0.5546875,0.5546875,0.5546875,0.5546875,0.3328125,0.5,0.2765625,0.5546875,0.5,0.721875,0.5,0.5,0.5,0.3546875,0.259375,0.353125,0.5890625]
  const avg = 0.5279276315789471
  return str
    .split('')
    .map(c => c.charCodeAt(0) < widths.length ? widths[c.charCodeAt(0)] : avg)
    .reduce((cur, acc) => acc + cur) * fontSize
}

export function str2ByteArr(str) {
  var utf8 = unescape(encodeURIComponent(str));
  return new Uint8Array(utf8.split('').map(function (item) {
    return item.charCodeAt();
  }));
}

export function base64ToArrayBuffer(base64) {
  var binaryString = window.atob(base64);
  var binaryLen = binaryString.length;
  var bytes = new Uint8Array(binaryLen);
  for (var i = 0; i < binaryLen; i++) {
     var ascii = binaryString.charCodeAt(i);
     bytes[i] = ascii;
  }
  return bytes;
}

export function saveYamlFile(reportName, byte) {
  var blob = new Blob([byte], {type: "text/plain"});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  var fileName = reportName;
  link.download = fileName;
  link.click();
}

export function saveRouteImage(imageName, byte) {
  var blob = new Blob([byte], {type: "image/png"});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  var fileName = imageName;
  link.download = fileName;
  link.click();
}

export function saveRouteDiagram(zipFile, byte) {
  var blob = new Blob([byte], {type: "application/zip"});
  var link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = zipFile;
  link.click();
}