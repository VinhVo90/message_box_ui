// File management
export const ID_CONTAINER_INPUT_MESSAGE = 'containerInputMessage';
export const ID_CONTAINER_OPERATIONS = 'containerOperations';
export const ID_CONTAINER_OUTPUT_MESSAGE = 'containerOutputMessage';
export const ID_SVG_INPUT_MESSAGE = 'svgInputMessage';
export const ID_SVG_OPERATIONS = 'svgOperations';
export const ID_SVG_OUTPUT_MESSAGE = 'svgOutputMessage';
export const ID_SVG_CONNECT = 'svgConnect';

// Vertex
export const CLASS_CONTAINER_VERTEX = 'groupVertex';
export const VERTEX_ATTR_SIZE = {
  HEADER_HEIGHT: 38,
  PROP_HEIGHT: 26,
  GROUP_WIDTH: 220,
  SPACE_COPY: 5, // When copy vertex then new coordinate = old coordinate + spaceAddVertex
  CONNECTOR_WITH: 12,
  CONNECTOR_HEIGHT: 25,
  DATA_ELEMENT_FONT_SIZE: 10,
  HEADER_FONT_SIZE: 13
};
export const CONNECT_SIDE = {
  NONE: 'NONE',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  BOTH: 'BOTH',
};
export const CONNECT_TYPE = {
  OUTPUT: 'O',
  INPUT: 'I',
};

export const LINE_TYPE = {
  SOLID: 'S',
  DASH: 'D',
};

export const VIEW_MODE = {
  SHOW_ONLY: 'SHOW_ONLY',
  EDIT: 'EDIT',
  OPERATIONS: 'OPERATIONS',
  INPUT_MESSAGE: 'INPUT_MESSAGE',
  OUTPUT_MESSAGE: 'OUTPUT_MESSAGE',
  SEGMENT: 'SEGMENT',
  ROUTE_DIAGRAM: 'ROUTE_DIAGRAM'
};

// Boundary
export const CLASS_CONTAINER_BOUNDARY = 'groupBoundary';
export const CLASS_MENU_ITEM_BOUNDARY = 'menuItemBoundary';
export const BOUNDARY_ATTR_SIZE = {
  HEADER_HEIGHT: 38,
  BOUND_WIDTH: 220,
  BOUND_HEIGHT: 64,
  PADDING: 5,
  CHILD_MARGIN: 20,
  HEADER_FONT_SIZE: 13
};

// Repeat range
export const REPEAT_RANGE = {
  MIN: 0,
  MAX: 9999,
};

// Vertex format type
export const VERTEX_FORMAT_TYPE = {
  BOOLEAN: 1,
  ARRAY: 2,
  NUMBER: 3,
  STRING: 4,
  LABEL: 5,
};

// Padding size left and top
export const PADDING_POSITION_SVG = {
  MIN_OFFSET_X: 5,
  MIN_OFFSET_Y: 5,
};

// Graph size
export const DEFAULT_CONFIG_GRAPH = {
  MIN_WIDTH: 1900,
  MIN_HEIGHT: 1800,
};

export const AUTO_SCROLL_CONFIG = {
  LIMIT_TO_SCROLL: 10,
};

// Popup config
export const POPUP_CONFIG = {
  MAX_WIDTH: 1550,
  MIN_WIDTH: 450,
  PADDING_CHAR: 18,
  WIDTH_CHAR: 10,
  WIDTH_CHAR_UPPER: 11.5,
  WIDTH_COL_DEL_CHECK: 45,
};

// Vertex group option
export const VERTEX_GROUP_OPTION = {
  SHOW_FULL_ALWAYS: 'SHOW_FULL_ALWAYS',
  DYNAMIC_DATASET: 'DYNAMIC_DATASET',
};

export const DATA_ELEMENT_TYPE = {
  SIMPLE: 'SIMPLE',
  COMPOSITE: 'COMPOSITE',
  COMPONENT: 'COMPONENT',
};

export const ACTION_TYPE = {
  CREATE: 'CREATE',
  UPDATE_INFO: 'UPDATE_INFO',
  DELETE: 'DELETE',
  DELETE_ALL: 'DELETE_ALL',
  COPY_ALL: 'COPY_ALL',
  MOVE: 'MOVE',
  CONNECTOR_CHANGE: 'CONNECTOR_CHANGE',
  MEMBER_CHANGE: 'MEMBER_CHANGE',
  PARENT_CHANGE: 'PARENT_CHANGE',
  MEMBER_INDEX_CHANGE: 'MEMBER_INDEX_CHANGE',
  CLEAR_ALL_VERTEX_BOUNDARY: 'CLEAR_ALL_VERTEX_BOUNDARY',
  CLEAR_ALL_EDGE: 'CLEAR_ALL_EDGE',
  AUTO_ALIGNMENT: 'AUTO_ALIGNMENT',
  VISIBLE_MEMBER: 'VISIBLE_MEMBER',
  SHOW_FULL: 'SHOW_FULL',
  SHOW_REDUCED: 'SHOW_REDUCED',
  UPDATE_SHOW_FULL_STATUS: 'UPDATE_SHOW_FULL_STATUS',
  UPDATE_SHOW_REDUCED_STATUS: 'UPDATE_SHOW_REDUCED_STATUS',
};

export const OBJECT_TYPE = {
  VERTEX: 'V',
  BOUNDARY: 'B',
  EDGE: 'E',
};

export const VERTEX_GROUP_TYPE = {
  SEGMENT: 'SEGMENT',
  OPERATION: 'OPERATION',
};

export const NOTE_TYPE = {
  ORIGIN: 'originNote',
  MID: 'middleNote',
  DEST: 'destNote',
};

export const ROUTE_TYPE = {
  SOURCE: 'SOURCE',
  FILTERS: 'FILTERS',
  INPUT_BACKUP: 'INPUT_BACKUP',
  CONVERTERS: 'CONVERTERS',
  OUTPUT_BACKUP: 'OUTPUT_BACKUP',
  DESTINATION: 'DESTINATION'
};

export const LINE_STYLE = {
  STRAIGHT: 'STRAIGHT',
  POLYLINES: 'POLYLINES'
}

export const ORDER_TYPE = {
  VERTICAL: 'VERTICAL',
  HORIZONTAL: 'HORIZONTAL'
}

export const IPC_MESSAGE = {
  OPEN_FOLDER_DIALOG: 'OPEN_FOLDER_DIALOG',
  OPEN_FILE_DIALOG: 'OPEN_FILE_DIALOG',
  OPEN_SAVE_FILE_DIALOG: 'OPEN_SAVE_FILE_DIALOG'
}

export const COMMON_DATA = {
  // isCreatingEdge: false, // Define state creation connect (edge)
  // tmpSource: null, // Define source node for create connect
  sourceId: null, // Store temporary vertex id at source when start create edge
  isSelectingEdge: false, // Define state has an edge is selecting
  isDisabledCommand: false, // Define disable or enable command on menu context)
  // vertexTypes: null, // Vertex types using in current graph
  // vertexTypesOld: null, // Vertex types export in file Graph Data Structure => Used to validate
  // isImportVertexTypeDefine: false, // If vertex type define was imported.
  // isUpdateEdge: false, // Set state is updating an edge
  // groupVertexOption: {}, // List vertex type have same option.
  // vertexDefine: null, // Data of json file vertex type definition.
  // vertexFormatType: {}, // Vertex group format type
  // vertexFormat: {}, // Data element vertex format
  // vertexGroupType: {}, // Group vertex type
  // headerForm: {}, // Header group type
  // vertexPresentation: {}, // Group vertex presentation
  // vertexGroup: null, // Group vertex
  currentWidth: 1900, // Default current width graph
  currentHeight: 1800, // Default current height graph
  viewMode: VIEW_MODE.EDIT,
};
