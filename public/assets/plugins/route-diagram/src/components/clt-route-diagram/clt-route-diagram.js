import * as d3 from 'd3';
import _ from 'lodash';
import ObjectUtils from '../../common/utilities/object.util';
import VertexMgmt from '../common-objects/objects/vertex-mgmt';
import BoundaryMgmt from '../common-objects/objects/boundary-mgmt';
import EdgeMgmt from '../common-objects/objects/edge-mgmt';
import MainMenu from '../common-objects/menu-context/main-menu';
import FindMenu from '../common-objects/menu-context/find-menu';
import History from '../../common/new-type-define/history';
import HistoryElement from '../../common/new-type-define/historyElement';
import State from '../../common/new-type-define/state';
const yarml = require('../../../assets/lib/yaml/js-yaml.min');
const path = require('path');

import {
	setSizeGraph,
	setMinBoundaryGraph,
	hideFileChooser,
	filterPropertyData,
	isPopupOpen,
  comShowMessage,
  base64ToArrayBuffer,
  saveYamlFile,
  saveRouteImage,
  saveRouteDiagram
} from '../../common/utilities/common.util';

import { 
	DEFAULT_CONFIG_GRAPH, VIEW_MODE, CONNECT_SIDE, ACTION_TYPE, OBJECT_TYPE, ROUTE_TYPE, CONNECT_TYPE, BOUNDARY_ATTR_SIZE, ORDER_TYPE, LINE_STYLE, LINE_TYPE, IPC_MESSAGE, VERTEX_ATTR_SIZE,
} from '../../common/const/index';

const ID_TAB_SEGMENT_SET = 'addressSegmentSet';
const ID_TAB_MESSAGE_SPEC = 'addressMessageSpec';
const FOCUSED_CLASS = 'focused-object';
const CONNECT_KEY = 'Connected';
const ID_LIST_VIEW = 'list-tab';

class CltRouteDiagram {
	constructor(props) {
		this.selector = props.selector;
		this.viewMode = {value: props.viewMode || VIEW_MODE.ROUTE_DIAGRAM};
		this.history = new History();
		
		this.mandatoryDataElementConfig = props.mandatoryDataElementConfig; // The configuration for Data element validation
		if (!this.mandatoryDataElementConfig) {
			this.mandatoryDataElementConfig = {
				mandatoryEvaluationFunc: (dataElement) => { return false },
				colorWarning: '#ff8100',
				colorAvailable: '#5aabff'
			};
		}

		this.selectorName = this.selector.selector.replace(/[\.\#]/,'');

		this.svgContainerId = `svgContainer_${this.selectorName}`;
		this.graphSvgId = `graphSvg_${this.selectorName}`;
		this.connectSvgId = `connectSvg_${this.selectorName}`;

		this.isShowReduced = false;

		this.mouseX = -1;
    this.mouseY = -1;
    
    this.routeConfigDatas = [];
    this.generateDiagramData = [];

    this.borderInfo = {
      mainRectId: "borderMainRect",
      rightOfSourcesLineId: "borderRightOfSourcesLine",
      leftOfDestinationLineId: "borderLeftOfDestinationLine",
      middleVerticalLineId: "borderMiddleVerticalLine",
      middleHorizontalLineId: "borderMiddleHorizontalLine"
    }

		this.initialize();
	}

	initialize() {

    this.objectUtils = new ObjectUtils();

		this.initSvgHtml();

		this.dataContainer = {
			vertex: [],
			boundary: [],
			edge: []
    };

    // use for finding any change
    this.backupDataContainer = {
      vertex: [],
			boundary: [],
			edge: []
    };
    
    // for generate diagram
    this.dummyDataContainer = {
			vertex: [],
			boundary: [],
			edge: []
    };
    
    // for store the current state of all diagram
    this.listOfDataContainer = [];

		this.edgeMgmt = new EdgeMgmt({
			dataContainer: this.dataContainer,
			svgId: this.graphSvgId,
			vertexContainer: [
				this.dataContainer
      ],
      viewMode: this.viewMode,
			history: this.history
    });
    
    this.dummyEdgeMgmt = new EdgeMgmt({
			dataContainer: this.dummyDataContainer,
			svgId: `dummy_${this.graphSvgId}`,
			vertexContainer: [
				this.dummyDataContainer
      ],
      viewMode: this.viewMode
    });

		this.vertexMgmt = new VertexMgmt({
			mainParent: this,
			dataContainer : this.dataContainer,
			containerId : this.svgContainerId,
			svgId : this.graphSvgId,
			viewMode: this.viewMode,
			connectSide: CONNECT_SIDE.NONE,
			edgeMgmt : this.edgeMgmt,
			mandatoryDataElementConfig: this.mandatoryDataElementConfig,
			history: this.history
    });

    this.vertexMgmt.processDataVertexTypeDefine(this.defaultVertexDefinition());
    
    this.dummyVertexMgmt = new VertexMgmt({
			mainParent: this,
			dataContainer : this.dummyDataContainer,
			containerId : `dummy_${this.svgContainerId}`,
			svgId : `dummy_${this.graphSvgId}`,
			viewMode: this.viewMode,
			connectSide: CONNECT_SIDE.NONE,
			edgeMgmt : this.dummyEdgeMgmt,
			mandatoryDataElementConfig: this.mandatoryDataElementConfig
    });
    
    this.dummyVertexMgmt.processDataVertexTypeDefine(this.defaultVertexDefinition());

		this.boundaryMgmt = new BoundaryMgmt({
			mainParent: this,
			dataContainer: this.dataContainer,
			containerId: this.svgContainerId,
			svgId: this.graphSvgId,
			viewMode: this.viewMode,
			vertexMgmt: this.vertexMgmt,
			edgeMgmt: this.edgeMgmt,
			history: this.history
    });
    
    this.dummyBoundaryMgmt = new BoundaryMgmt({
			mainParent: this,
			dataContainer: this.dummyDataContainer,
			containerId: `dummy_${this.svgContainerId}`,
			svgId: `dummy_${this.graphSvgId}`,
			viewMode: this.viewMode,
			vertexMgmt: this.dummyVertexMgmt,
			edgeMgmt: this.dummyEdgeMgmt
		});


		this.initCustomFunctionD3();
		this.objectUtils.initListenerContainerScroll(this.svgContainerId, this.edgeMgmt, [this.dataContainer]);
		this.objectUtils.initListenerOnWindowResize(this.edgeMgmt, [this.dataContainer]);
		this.initOnMouseUpBackground();
		this.initShortcutKeyEvent();
	}

	initSvgHtml() {
		const sHtml = 
		`<div id="${this.svgContainerId}" class="svgContainer noneAddressBar" ref="${this.graphSvgId}">
      <svg id="${this.graphSvgId}" class="svg"></svg>
    </div>
    <div id="dummy_${this.svgContainerId}" class="svgContainer noneAddressBar" ref="dummy_${this.graphSvgId}">
      <svg id="dummy_${this.graphSvgId}" class="svg"></svg>
    </div>`;

		this.selector.append(sHtml);
	}

	initCustomFunctionD3() {
		/**
     * Move DOM element to front of others
     */
		d3.selection.prototype.moveToFront = function () {
			return this.each(function () {
				this.parentNode.appendChild(this);
			})
		}

		/**
     * Move DOM element to back of others
     */
		d3.selection.prototype.moveToBack = function () {
			this.each(function () {
				this.parentNode.firstChild && this.parentNode.insertBefore(this, this.parentNode.firstChild);
			})
		}
	}

	initMenuContext() {
		new MainMenu({
			selector: `#${this.graphSvgId}`,
			containerId: `#${this.svgContainerId}`,
			parent: this,
			vertexDefinition: this.vertexMgmt.vertexDefinition,
			viewMode: this.viewMode,
			history: this.history
		});

		new FindMenu({
			selector: `#${this.svgContainerId}`,
			dataContainer: this.dataContainer,
		});
	}

	initShortcutKeyEvent() {
		// Prevent Ctrl+F on brownser
		window.addEventListener("keydown",function (e) {
			if (e.keyCode === 114 || (e.ctrlKey && e.keyCode === 70)) {
					e.preventDefault();
			}
		});

		// capture mouse point for creating menu by Ctrl+F
		$(`#${this.graphSvgId}`).mousemove( (e) => {
			this.mouseX = e.pageX;
			this.mouseY = e.pageY;
		});

		// Create menu by Ctrl+F
		$(window).keyup((e) => {
			if (isPopupOpen()) return;

      if ((e.keyCode == 70 || e.keyCode == 102)  && e.ctrlKey) {
				// Ctrl + F
				$(`#${this.svgContainerId}`).contextMenu({x:this.mouseX, y: this.mouseY});
				$('.context-menu-root input').focus();
				
      } else if ((e.keyCode == 67 || e.keyCode == 99)  && e.ctrlKey) {
				// Ctrl+C
				const $focusedObject = $(`#${this.graphSvgId} .${FOCUSED_CLASS}`);

				if ($focusedObject.length > 0) {
					const id = $focusedObject[0].id;

					let object = null;
					if (id.substr(0,1) === OBJECT_TYPE.VERTEX) {
						object = _.find(this.dataContainer.vertex, {"id": id});
						object.copy();
					} else {
						object = _.find(this.dataContainer.boundary, {"id": id});
						object.copyAll();
					}
				}
			} else if (e.keyCode == 46) {
				// Delete key
				const $focusedObject = $(`#${this.graphSvgId} .${FOCUSED_CLASS}`);

				if ($focusedObject.length > 0) {
					const id = $focusedObject[0].id;

					let object = null;
					if (id.substr(0,1) === OBJECT_TYPE.VERTEX) {
						object = _.find(this.dataContainer.vertex, {"id": id});
						object.remove();
					} else {
						object = _.find(this.dataContainer.boundary, {"id": id});
						object.deleteAll();
					}
				}
			} else if ((e.keyCode == 90 || e.keyCode == 122)  && e.ctrlKey) {
				// Ctrl + Z
				this.history.undo();
			} else if ((e.keyCode == 89 || e.keyCode == 121)  && e.ctrlKey) {
				// Ctrl + Y
				this.history.redo();
			}
		});
		
		
	}

	createVertex(opt) {
		this.vertexMgmt.create(opt);
  }
  
	/**
   * Clear all element on graph
   * And reinit marker def
   */
	clearAll(state) {
		const oldDataContainer = {
			vertex: filterPropertyData(this.dataContainer.vertex, [], ['dataContainer']),
			boundary: filterPropertyData(this.dataContainer.boundary, [], ['dataContainer'])
		}

		this.vertexMgmt.clearAll();
		this.boundaryMgmt.clearAll();

		if (state) {
			let he = new HistoryElement();
			he.actionType = ACTION_TYPE.CLEAR_ALL_VERTEX_BOUNDARY;
			he.dataObject = oldDataContainer;
			he.realObject = this;
			state.add(he);
		}

		setSizeGraph({ width: DEFAULT_CONFIG_GRAPH.MIN_WIDTH, height: DEFAULT_CONFIG_GRAPH.MIN_HEIGHT }, this.graphSvgId);
	}

	showReduced() {
		const state = new State();

		this.isShowReduced = true;
		this.objectUtils.showReduced(this.dataContainer, this.graphSvgId, this.viewMode.value, state);

		if (this.history) {
			const he = new HistoryElement();
			he.actionType = ACTION_TYPE.UPDATE_SHOW_REDUCED_STATUS;
			he.realObject = this;
			state.add(he);
			this.history.add(state);
		}
	}

	showFull() {
		const state = new State();
		
		this.isShowReduced = false;
		this.objectUtils.showFull(this.dataContainer, this.graphSvgId, this.viewMode.value, state);

		if (this.history) {
			const he = new HistoryElement();
			he.actionType = ACTION_TYPE.UPDATE_SHOW_FULL_STATUS;
			he.realObject = this;
			state.add(he);
			this.history.add(state);
		}
  }
  
  loadScreen(configDatas) {
    if (configDatas.length === 0) return;

    this.listOfDataContainer = [];

    this.routeConfigDatas = configDatas;

    this.loadListView(configDatas);
    this.loadRouteConfig(configDatas[0]);
  }
  
  loadRouteConfig(configData) {
    // convert to yaml object
    const yamlObject = yarml.safeLoad(configData.content);

    //clear data
		this.clearAll();
    this.edgeMgmt.clearAll();

    this.routeInfo = yamlObject.info;

    const graphData = this.createRouteGraphData(yamlObject);
    
    this.isShowReduced = false;

    this.drawRouteGragh(graphData);
    
    this.initMenuContext();

    this.autoAlignment(false);

    this.autoCreateLine();

    this.listOfDataContainer.push({
      name: configData.name,
      dataContainer: {
        vertex: filterPropertyData(this.dataContainer.vertex, [], ['dataContainer']),
        boundary: filterPropertyData(this.dataContainer.boundary, [], ['dataContainer']),
        edge: filterPropertyData(this.dataContainer.edge, [], ['dataContainer'])
      },
      isShowReduced: this.isShowReduced
    });

    setMinBoundaryGraph(this.dataContainer,this.graphSvgId, this.viewMode.value);

		hideFileChooser();
  }

  async generateDiagram() {
    this.generateDiagramData = [];
    if (this.isScreenLoaded()) {
      this.generateDiagramFromLoadedData();
    } else {
      this.generateDiagramFromLocalData();
    }
  }

  async generateDiagramFromLoadedData() {
    const configDatas = this.routeConfigDatas;

    const selectedDiagramName = $(`#list-tab .active`).text();

    // Show page loader 
    const $loader = $('<div>');
    $loader.attr('id', 'loader');
    $loader.text('Loading...');
    $('body').append($loader);    
    
    const tmpIsShowReduced = this.isShowReduced;
    for (let i = 0; i < configDatas.length; i += 1) {
      let loadedDataContainer = {};
      if (configDatas[i].name === selectedDiagramName) {
        loadedDataContainer.dataContainer = this.dataContainer;
        loadedDataContainer.isShowReduced = tmpIsShowReduced;
      } else {
        loadedDataContainer = _.find(this.listOfDataContainer, {name: configDatas[i].name});
      }

      if (loadedDataContainer) {
        this.isShowReduced = loadedDataContainer.isShowReduced;
        this.drawObjectsForGenerate(loadedDataContainer.dataContainer);
      } else {
        this.loadRouteConfigForGenerate(configDatas[i]);
      }
      
      await this.saveToImageForGenerate('/' + configDatas[i].name + '.png', 'diagram');
      let imageData = this.generateDiagramData[this.generateDiagramData.length - 1];
      imageData['filename'] = configDatas[i].name + '.png';
      imageData['name'] = configDatas[i].name;
      this.clearAllForGenerate();
    }
    
    this.isShowReduced = tmpIsShowReduced;

    fetch('/api/generateDiagram', {
      method: 'POST',
      body: JSON.stringify({data : this.generateDiagramData}),
      headers:{
        'Content-Type': 'application/json'
      }
    }).then(res => res.json())
    .then(data => {
      saveRouteDiagram('diagram.zip', base64ToArrayBuffer(data.data));
    })
    .catch(error => console.error('Error:', error))

    $('#loader').remove();

    hideFileChooser();
  }

  async generateDiagramFromLocalData() {
    const self = this;
    window.app.openSelectFile({mode : 'Diagram', callback : async function(filePath) {
      fetch('/api/readYamlFile', {
        method: 'POST',
        body: JSON.stringify({path : filePath}),
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
      .then(async (data) => {
        if (data.length === 0) {
          comShowMessage('There is no any config file to generate');
          return;
        };
        const configDatas = data;

        // Show page loader 
        const $loader = $('<div>');
        $loader.attr('id', 'loader');
        $loader.text('Loading...');
        $('body').append($loader);
        
        for (let i = 0; i < configDatas.length; i += 1) {
          self.loadRouteConfigForGenerate(configDatas[i]);
          await self.saveToImageForGenerate('/' + configDatas[i].name + '.png', 'diagram');
          let imageData = self.generateDiagramData[self.generateDiagramData.length - 1];
          imageData['filename'] = configDatas[i].name + '.png';
          imageData['name'] = configDatas[i].name;
          self.clearAllForGenerate();
        }

        fetch('/api/generateDiagram', {
          method: 'POST',
          body: JSON.stringify({data : self.generateDiagramData}),
          headers:{
            'Content-Type': 'application/json'
          }
        }).then(res => res.json())
        .then(data => {
          saveRouteDiagram('diagram.zip', base64ToArrayBuffer(data.data));
        })
        .catch(error => console.error('Error:', error))

        $('#loader').remove();

        hideFileChooser();
      })
      .catch(error => console.error('Error:', error))
    }});
  }

  clearAllForGenerate() {
    this.dummyEdgeMgmt.clearAll();
    this.dummyVertexMgmt.clearAll();
    this.dummyBoundaryMgmt.clearAll();

    setSizeGraph({ width: DEFAULT_CONFIG_GRAPH.MIN_WIDTH, height: DEFAULT_CONFIG_GRAPH.MIN_HEIGHT }, `dummy_${this.graphSvgId}`);
  }

  loadRouteConfigForGenerate(configData) {
    // convert to yaml object
    const yamlObject = yarml.safeLoad(configData.content);

    const graphData = this.createRouteGraphData(yamlObject);

    this.isShowReduced = false;

    this.drawRouteGragh(graphData, 'GENERATE');
    
    this.autoAlignment(false, 'GENERATE');

    this.autoCreateLine('GENERATE');

    setMinBoundaryGraph(this.dummyDataContainer, `dummy_${this.graphSvgId}`, this.viewMode.value);
  }

	save() {
    if (!this.isScreenLoaded()) {
      comShowMessage('There is no data to save.');
      return;
    }

    if (!this.validateMandatoryDataElement()) {
      if (!confirm('Missing mandatory data.\nContinue saving?'))
        return;
    }
    
    const saveString = this.getSaveData();

    saveYamlFile($('#list-tab .list-group-item.active').text(), saveString);

    hideFileChooser();
	}
  
  getSaveData() {
    const { sources , filters , input_backup , converters , output_backup , destination } = this.filterData(this.dataContainer);
    const presentation = this.vertexMgmt.vertexDefinition.vertexGroup[0].vertexPresentation;
    let resStr = '';

    // info
    resStr += 'info:\n';
    for (let prop in this.routeInfo) {
      resStr += `  ${prop}: "${this.replaceSpecialCharecters(this.routeInfo[prop].toString())}"\n`;
    }

    // route
    resStr += '\nroute:\n';
    sources.forEach(element => {
      resStr += `  - type: "SOURCE"\n`;
      element.data.forEach(dataElement => {
        resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
      });

      resStr += "\n";
    });

    input_backup.forEach(element => {
      resStr += `  - type: "INPUT_BACKUP"\n`;
      element.data.forEach(dataElement => {
        resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
      });

      resStr += "\n";
    });

    output_backup.forEach(element => {
      resStr += `  - type: "OUTPUT_BACKUP"\n`;
      element.data.forEach(dataElement => {
        resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
      });

      resStr += "\n";
    });

    destination.forEach(element => {
      resStr += `  - type: "DESTINATION"\n`;
      element.data.forEach(dataElement => {
        resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
      });

      resStr += "\n";
    });

    // filters
    resStr += 'filters:\n';
    filters.forEach(element => {
      element.data.forEach((dataElement, index) => {
        if (0 == index) {
          resStr += `  - ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
        } else {
          resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
        }
      });

      resStr += "\n";
    });

    // converters
    resStr += 'converters:\n';
    converters.forEach(element => {
      element.data.forEach((dataElement, index) => {
        if (0 == index) {
          resStr += `  - ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
        } else {
          resStr += `    ${dataElement[presentation.key]}: "${this.replaceSpecialCharecters(dataElement[presentation.value].toString())}"\n`;
        }
      });

      resStr += "\n";
    });

    return resStr;
  }

	initOnMouseUpBackground() {
		let selector = this.selector.prop('id');

		if (selector == '') {
			selector = `.${this.selector.prop('class')}`;
		}else{
			selector = `#${selector}`;
		}
    
		const tmpEdgeMgmt = this.edgeMgmt
		d3.select(selector).on('mouseup', function() {
			const mouse = d3.mouse(this);
			const elem = document.elementFromPoint(mouse[0], mouse[1]);

			//disable selecting effect if edge is selecting
      if((!elem || !elem.tagName || elem.tagName != 'path')) {
        if (tmpEdgeMgmt.isSelectingEdge()) {
          tmpEdgeMgmt.cancleSelectedPath();
        }

        d3.select(`.${FOCUSED_CLASS}`).classed(FOCUSED_CLASS, false);
			}
		})
	}

	showFileNameOnApplicationTitleBar() {
		const segmentSetFileName = $(`#${ID_TAB_SEGMENT_SET}`).attr('title');
		const messageSpecFileName = $(`#${ID_TAB_MESSAGE_SPEC}`).attr('title');

		const applicationTitle = 'Message Spec Editor';
		let fileNameList = '';
		if (segmentSetFileName !== undefined && segmentSetFileName !== '') {
			if (fileNameList !== '') {
				fileNameList += ` - ${segmentSetFileName}`;
			} else {
				fileNameList += `${segmentSetFileName}`;
			}
		}

		if (messageSpecFileName !== undefined && messageSpecFileName !== '') {
			if (fileNameList !== '') {
				fileNameList += ` - ${messageSpecFileName}`;
			} else {
				fileNameList += `${messageSpecFileName}`;
			}
		}

		$('head title').text(`${applicationTitle} | ${fileNameList} |`);
	}

  /**
   * 
   * @param {*} dataContainer 
   */
	restore(dataContainer) {
		const { boundary: boundaries, vertex: vertices} = dataContainer;
		// Draw boundary
		boundaries.forEach(e => {
			this.boundaryMgmt.create(e);
		})
		// Draw vertex
		vertices.forEach(e => {
			this.vertexMgmt.create(e);
		})

		setMinBoundaryGraph(this.dataContainer, this.svgId, this.viewMode.value);
  }
  
  defaultVertexDefinition() {
		return {
			"VERTEX_GROUP": [
        {
          "groupType": "SEGMENT",
          "option": ["DYNAMIC_DATASET"],
          "dataElementFormat": {
            "usage": [
              "C",
              "M"
            ],
            "name": "",
            "value": "",
            "description": ""
          },
          "vertexPresentation": {
            "key": "name",
            "value": "value",
            "keyTooltip": "name",
            "valueTooltip": "value",
            "keyPrefix": {
              "usage": {
                "M": "[M] ",
                "C": "[C] "
              }
            }
          }
        }
      ],
      "VERTEX": [
        {
          "groupType": "SEGMENT",
          "vertexType": "ITEM",
          "description": ""
        }
      ]
		};
  }
  
  createRouteGraphData(configData) {
    let graphData = {
      vertex: [],
      boundary: [],
      edge: []
    }

    const {route, filters, converters} = configData;

    if (route) {
      route.forEach(item => {
        let vertex = {
          groupType: 'SEGMENT',
          vertexType: item.type,
          name: item.type,
          description: item.type,
          data: [
          ]
        }

        for (let prop in item) {
          if ('type' != prop) {
            const itemTypeInfo = this.getRouteItem(item.type, item.protocol, prop);
            vertex.data.push({
              usage: prop === 'protocol' ? 'M' : itemTypeInfo.usage,
              name: prop,
              value: item[prop],
              description: itemTypeInfo.description
            });
          }
        }

        graphData.vertex.push(vertex);
      });
    }

    if (filters) {
      filters.forEach(item => {
        let vertex = {
          groupType: 'SEGMENT',
          vertexType: 'FILTERS',
          name: 'FILTERS',
          description: 'FILTERS',
          data: [
          ]
        }

        for (let prop in item) {
          const itemTypeInfo = this.getRouteItem('FILTERS', item.type, prop);
          vertex.data.push({
            usage: prop === 'type' ? 'M' : itemTypeInfo.usage,
            name: prop,
            value: item[prop],
            description: itemTypeInfo.description
          });
        }

        graphData.vertex.push(vertex);
      });
    }

    if (converters) {
      converters.forEach(item => {
        let vertex = {
          groupType: 'SEGMENT',
          vertexType: 'CONVERTERS',
          name: 'CONVERTERS',
          description: 'CONVERTERS',
          data: [
          ]
        }

        for (let prop in item) {
          const itemTypeInfo = this.getRouteItem('CONVERTERS', item.type, prop);
          vertex.data.push({
            usage: prop === 'type' ? 'M' : itemTypeInfo.usage,
            name: prop,
            value: item[prop],
            description: itemTypeInfo.description
          });
        }

        graphData.vertex.push(vertex);
      });
    }

    return graphData;
  }

  drawRouteGragh(graphData, mode = 'VIEW') {
    let vertexMgmt, boundaryMgmt, dataContainer;

    if (mode === 'VIEW') {
      dataContainer = this.dataContainer;
      vertexMgmt = this.vertexMgmt;
      boundaryMgmt = this.boundaryMgmt;
    } else {
      // GENERATE mode
      dataContainer = this.dummyDataContainer;
      vertexMgmt = this.dummyVertexMgmt;
      boundaryMgmt = this.dummyBoundaryMgmt;
    }

    graphData.vertex.forEach(vertex => {
      vertexMgmt.create(vertex);
    });

    const { sources , filters , input_backup , converters , output_backup , destination } = this.filterData(dataContainer);
    
    // SOURCE Group
    let member = [];
    let boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'SOURCE'
    });

    sources.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });

    boundaryObject.member = member;

    // FILTERS Group
    member = [];
    boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'FILTERS'
    });

    filters.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });
    
    boundaryObject.member = member;

    // INPUT_BACKUP Group
    member = [];
    boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'INPUT_BACKUP',
      orderType: ORDER_TYPE.HORIZONTAL
    });

    input_backup.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });
   
    boundaryObject.member = member;

    // CONVERTERS
    member = [];
    boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'CONVERTERS'
    });

    converters.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });    

    boundaryObject.member = member;

    // OUTPUT_BACKUP
    member = [];
    boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'OUTPUT_BACKUP',
      orderType: ORDER_TYPE.HORIZONTAL
    });

    output_backup.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });

    boundaryObject.member = member;

    // DESTINATION
    member = [];
    boundaryObject = {};

    boundaryObject = boundaryMgmt.create({
      name: 'DESTINATION'
    });

    destination.forEach(item => {
      item.parent = boundaryObject.id;
      member.push({
        id: item.id,
        type: item.type,
        show: true
      });
    });

    boundaryObject.member = member;

    this.objectUtils.updateHeightBoundary(dataContainer);
  }

  filterData(dataContainer) {
    let sources = [], filters = [], input_backup = [], converters = [], output_backup = [], destination = [];

    for (let i = 0; i < dataContainer.vertex.length; i += 1) {
      const item = dataContainer.vertex[i];

      if (item.vertexType == ROUTE_TYPE.SOURCE) {
        sources.push(item);
      }

      if (item.vertexType == ROUTE_TYPE.FILTERS) {
        filters.push(item);
      }

      if (item.vertexType == ROUTE_TYPE.INPUT_BACKUP) {
        input_backup.push(item);
      }

      if (item.vertexType == ROUTE_TYPE.CONVERTERS) {
        converters.push(item);
      }

      if (item.vertexType == ROUTE_TYPE.OUTPUT_BACKUP) {
        output_backup.push(item);
      }

      if (item.vertexType == ROUTE_TYPE.DESTINATION) {
        destination.push(item);
      }
    }

    return {
      sources,
      filters,
      input_backup,
      converters,
      output_backup,
      destination
    }
  }

  autoAlignment(allowHistory = true, mode = 'VIEW') {
    let dataContainer, graphSvgId;
    if (mode === 'VIEW') {
      dataContainer = this.dataContainer;
      graphSvgId = this.graphSvgId;
    } else {
      // GENERATE mode
      dataContainer = this.dummyDataContainer;
      graphSvgId = `dummy_${this.graphSvgId}`;
    }

    const left = 50, top = 50;
    const groupDistance = 100;

    // for history
    let oldPositionStore;
    if (allowHistory) {
      oldPositionStore = {
        vertex: filterPropertyData(dataContainer.vertex, ['id', 'x', 'y']),
        boundary: filterPropertyData(dataContainer.boundary, ['id', 'x', 'y'])
      }
    }

    // sources
    const boundarySource = _.find(dataContainer.boundary, {name: 'SOURCE'});
    let x = left;
    let y = top;
    boundarySource.setPosition({x, y});

    // filters
    const boundaryFilters = _.find(dataContainer.boundary, {name: 'FILTERS'});
    x =boundarySource.x + boundarySource.width + groupDistance;
    y = top;
    boundaryFilters.setPosition({x, y});

    // input_backup
    const boundaryConverters = _.find(dataContainer.boundary, {name: 'CONVERTERS'});
    const maxHeight = boundaryFilters.height > boundaryConverters.height ? boundaryFilters.height : boundaryConverters.height;
    const boundaryInputBackup = _.find(dataContainer.boundary, {name: 'INPUT_BACKUP'});
    x = boundaryFilters.x;
    y = top + maxHeight + groupDistance;
    boundaryInputBackup.setPosition({x, y});

    // converters
    x = boundaryInputBackup.x + boundaryInputBackup.width + groupDistance;
    y = top;
    boundaryConverters.setPosition({x, y});

    // output_backup
    const boundaryOutputBackup = _.find(dataContainer.boundary, {name: 'OUTPUT_BACKUP'});
    x = boundaryConverters.x;
    y = boundaryInputBackup.y;
    boundaryOutputBackup.setPosition({x, y});

    // Destination
    const boundaryDestination = _.find(dataContainer.boundary, {name: 'DESTINATION'});
    x = boundaryOutputBackup.x + boundaryOutputBackup.width + groupDistance;
    y = top;
    boundaryDestination.setPosition({x, y});

    // For history
		if (allowHistory && this.history) {
			const state = new State();
			const he = new HistoryElement();
			he.actionType = ACTION_TYPE.AUTO_ALIGNMENT;
			he.oldObject = oldPositionStore;
			he.dataObject = { 
				vertex: filterPropertyData(this.dataContainer.vertex, ['id', 'x', 'y']),
				boundary: filterPropertyData(this.dataContainer.boundary, ['id', 'x', 'y']),
			};
			he.realObject = this;
			state.add(he);
			this.history.add(state);
    }
    
    setMinBoundaryGraph(dataContainer, graphSvgId, this.viewMode.value);
  }

  /**
   * create a line connect fromObjet and toObject by title connector
   * @param {*} fromObject 
   * @param {*} toObject 
   */
  createLine(fromObject, toObject, lineType = LINE_TYPE.SOLID, mode = 'VIEW') {
    let edgeMgmt;
    if (mode === 'VIEW') {
      edgeMgmt = this.edgeMgmt;
    } else {
      edgeMgmt = this.dummyEdgeMgmt;
    }

    // source point
    let prop = `${fromObject.id}${CONNECT_KEY}boundary_title`;
    const src = this.objectUtils.getCoordProp(fromObject, prop, CONNECT_TYPE.OUTPUT);
    src.vertexId = fromObject.id;
    src.prop = prop;
    src.svgId = fromObject.svgId;

    // target point
    prop = `${toObject.id}${CONNECT_KEY}boundary_title`;
    const des = this.objectUtils.getCoordProp(toObject, prop, CONNECT_TYPE.INPUT);
    des.vertexId = toObject.id;
    des.prop = prop;
    des.svgId = toObject.svgId;

    const options = {
      source: src,
      target: des,
      style: {
        line: lineType,
        lineStyle: LINE_STYLE.POLYLINES,
        lineWidth: 3
      }
    };

    edgeMgmt.create(options);
  }

  autoCreateLine(mode = 'VIEW') {
    let dataContainer;
    if (mode === 'VIEW') {
      dataContainer = this.dataContainer;
    } else {
      dataContainer = this.dummyDataContainer;
    }

    const boundarySource = _.find(dataContainer.boundary, {name: 'SOURCE'});
    const boundaryFilters = _.find(dataContainer.boundary, {name: 'FILTERS'});
    const boundaryInputBackup = _.find(dataContainer.boundary, {name: 'INPUT_BACKUP'});
    const boundaryConverters = _.find(dataContainer.boundary, {name: 'CONVERTERS'});
    const boundaryOutputBackup = _.find(dataContainer.boundary, {name: 'OUTPUT_BACKUP'});
    const boundaryDestination = _.find(dataContainer.boundary, {name: 'DESTINATION'});

    this.createLine(boundarySource, boundaryFilters, LINE_TYPE.SOLID, mode);
    this.createLine(boundaryFilters, boundaryInputBackup, LINE_TYPE.DASH, mode);
    this.createLine(boundaryFilters, boundaryConverters, LINE_TYPE.SOLID, mode);
    this.createLine(boundaryConverters, boundaryOutputBackup, LINE_TYPE.DASH, mode);
    this.createLine(boundaryConverters, boundaryDestination, LINE_TYPE.SOLID, mode);
  }

  replaceSpecialCharecters(str) {
    return str.replace(/\\/g, '\\\\');
  }

  setBoundaryPadding(value) {
    BOUNDARY_ATTR_SIZE.PADDING = parseInt(value);

    this.objectUtils.updateHeightBoundary(this.dataContainer);
  }

  setBoundaryChildMargin(value) {
    BOUNDARY_ATTR_SIZE.CHILD_MARGIN = parseInt(value);

    this.objectUtils.updateHeightBoundary(this.dataContainer);
  }

  defaultRouteConfig() {
    const protocol = {
      description: 'DIR, FTP, FTPS, SFTP, POP3, IMAP, SMTP',
      DIR: {
        check_interval: {
          usage: 'C',
          description: 'seconds'
        },
        backup_pattern:  {
          usage: 'C',
          description: 'datetime format'
        }
      },
      FTP: {
        check_interval: {
          usage: 'C',
          description: 'seconds'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'C',
          description: 'id'
        },
        password: {
          usage: 'C',
          description: 'password'
        },
        path: {
          usage: 'M',
          description: 'Remote path'
        },
      },
      FTPS: {
        check_interval: {
          usage: 'M',
          description: 'Seconds'
        },
        security: {
          usage: 'M',
          description: '[TLS, SSL]'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'M',
          description: 'id'
        },
        password: {
          usage: 'M',
          description: 'password'
        },
        path: {
          usage: 'M',
          description: 'Remote path'
        }
      },
      SFTP: {
        check_interval: {
          usage: 'M',
          description: 'Seconds'
        },
        security: {
          usage: 'M',
          description: '[TLS, SSL]'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'M',
          description: 'id'
        },
        password: {
          usage: 'M',
          description: 'password'
        },
        path: {
          usage: 'M',
          description: 'Remote path'
        }
      },
      POP3: {
        security: {
          usage: 'M',
          description: '[TLS, SSL]'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'M',
          description: 'id'
        },
        password: {
          usage: 'M',
          description: 'password'
        }
      },
      IMAP: {
        security: {
          usage: 'M',
          description: '[TLS, SSL]'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'M',
          description: 'id'
        },
        password: {
          usage: 'M',
          description: 'password'
        }
      },
      SMTP: {
        security: {
          usage: 'M',
          description: '[TLS, SSL]'
        },
        address: {
          usage: 'M',
          description: 'ftp_address:port'
        },
        user_id: {
          usage: 'M',
          description: 'id'
        },
        password: {
          usage: 'M',
          description: 'password'
        },
        path: {
          usage: 'M',
          description: 'Remote path'
        }
      }
    }

    const FILTERS = {
      type: {
        description: 'FILENAME_GLOB, FILENAME_REGEX, FILESIZE, FILECONTENT, FILECONTENT_REGEX',
        FILENAME_GLOB: {
          search_pattern: {
            usage: 'M',
            description: 'glob pattern'
          }
        },
        FILENAME_REGEX: {
          search_pattern: {
            usage: 'M',
            description: 'regex pattern'
          }
        },
        FILESIZE: {
          search_pattern: {
            usage: 'M',
            description: '[>, >=, <, <=] size'
          }
        },
        FILECONTENT: {
          search_pattern: {
            usage: 'M',
            description: '대상 문자열'
          }
        },
        FILECONTENT_REGEX: {
          search_pattern: {
            usage: 'M',
            description: 'regex pattern'
          }
        }
      }
    }

    const CONVERTERS = {
      type: {
        description: 'FILENAME_GLOB, FILENAME_REGEX, FILESIZE, FILECONTENT, FILECONTENT_REGEX',
        FILENAME_REPLACER: {
          search_pattern: {
            usage: 'M',
            description: 'regex pattern'
          },
          replace_pattern: {
            usage: 'M',
            description: 'regex pattern'
          }
        },
        FILENAME_REDUCER: {
          max_name_length: {
            usage: 'M',
            description: '최대 이름 길이'
          },
          name_cut_type: {
            usage: 'M',
            description: '[LEFT, RIGHT, RIGHT_KEEP_EXT]'
          }
        },
        FILECONTENT_REPLACER: {
          search_pattern: {
            usage: 'M',
            description: 'regex pattern'
          },
          replace_pattern: {
            usage: 'M',
            description: 'regex pattern'
          },
          skips: {
            usage: 'C',
            description: '건너뛸 라인 수'
          },
          repeats: {
            usage: 'C',
            description: '적용할 라인 수'
          }
        },
        FILE_ENVELOPER: {
          header: {
            usage: 'C',
            description: 'header 문자열'
          },
          footer: {
            usage: 'C',
            description: 'footer 문자열'
          }
        },        
        FILE_DEENVELOPER: {
          header: {
            usage: 'C',
            description: 'regex pattern'
          },
          footer: {
            usage: 'C',
            description: 'regex pattern'
          },
          split_pattern: {
            usage: 'C',
            description: 'regex pattern'
          }
        }
      }
    }
    return {
      SOURCE: {
        protocol
      },
      INPUT_BACKUP: {
        protocol
      },
      OUTPUT_BACKUP: {
        protocol
      },
      DESTINATION: {
        protocol
      },
      FILTERS,
      CONVERTERS
    }
  }

  getRouteItem(routeType, itemType, key) {
    const usage = this.defaultRouteConfig();
    const defaultInfo = {
      usage: 'C',
      description: ''
    }

    let itemInfo;
    switch (routeType) {
      case 'SOURCE':
      case 'INPUT_BACKUP':
      case 'OUTPUT_BACKUP':
      case 'DESTINATION':
        try {
          if ('protocol' === key) {
            itemInfo = usage[routeType]['protocol'];
          } else {
            itemInfo = usage[routeType]['protocol'][itemType][key];
          }
        } catch(ex) {
          resUsage = defaultInfo;
        }
        break;
      case 'FILTERS':
      case 'CONVERTERS':
        try {
          if ('type' === key) {
            itemInfo = usage[routeType]['type'];
          } else {
            itemInfo = usage[routeType]['type'][itemType][key];
          }
        } catch(ex) {
          itemInfo = defaultInfo;
        }
        break;
    }

    if (!itemInfo) itemInfo = defaultInfo;

    return itemInfo;
  }

  validateMandatoryDataElement() {
    for (let i = 0; i < this.dataContainer.vertex.length; i+= 1) {
      const vertex = this.dataContainer.vertex[i];
      for (let j = 0; j < vertex.data.length; j += 1) {
        const dataElement = vertex.data[j];
        if (dataElement.usage === 'M' && dataElement.value === '') return false;
      }
    }

    return true;
  }

  resetPosition(dataContainer) {
		this.dataContainer.boundary.forEach(e => {
			const oldObject = _.find(dataContainer.boundary, {id: e.id});
			e.setPosition({x: oldObject.x, y: oldObject.y}, false);
		});

		this.dataContainer.vertex.forEach(e => {
			const oldObject = _.find(dataContainer.vertex, {id: e.id});
			e.setPosition({x: oldObject.x, y: oldObject.y}, false);
		});

		setMinBoundaryGraph(this.dataContainer, this.graphSvgId, this.viewMode.value);
  }
  
  loadListView(data) {
    if (data.length === 0) return;

    const $listView = $(`#${ID_LIST_VIEW}`);

    $listView.empty();

    data.forEach(routeConfig => {
      const $a = $('<a>');
      $a.attr('class', 'list-group-item list-group-item-action');
      $a.attr('id', routeConfig.name);
      $a.attr('data-toggle', 'list');
      $a.css('cursor', 'pointer');
      $a.text(routeConfig.name);

      $listView.append($a);
    });

    // select first item as default
    $($listView.find('.list-group-item')[0]).addClass('active');

    // init click event
    const main = this;
    $('#list-tab .list-group-item').click(function(e) {
      if ($(this).hasClass('active')) return;

      // backup data for the previous route
      const preRouteName = $('#list-tab .active').text();
      const preRouteInfo = _.find(main.listOfDataContainer, {name: preRouteName});
      if (preRouteInfo) {
        preRouteInfo.dataContainer = {
          vertex: filterPropertyData(main.dataContainer.vertex, [], ['dataContainer']),
          boundary: filterPropertyData(main.dataContainer.boundary, [], ['dataContainer']),
          edge: filterPropertyData(main.dataContainer.edge, [], ['dataContainer'])
        }

        preRouteInfo.isShowReduced = main.isShowReduced;
      }

      // focus to current route
      $('.list-group .active').removeClass('active');
      $(this).addClass('active');

      const routeName = $(this).text();
      const routeConfig = _.find(main.routeConfigDatas, {name: routeName});

      const dataInfo = _.find(main.listOfDataContainer, {name: routeName});
      if (dataInfo) {
        main.isShowReduced = dataInfo.isShowReduced;
        main.drawObjects(dataInfo.dataContainer);
      } else {
        main.loadRouteConfig(routeConfig);
      }
    });
  }

  /**
	 * Define which css will be gotten from computedStyle to put into style property for export image
	 */
	getStylingList() {
		return [
      {el: '#export_image .boundary_content .boundary_header', properties: ['font-family', 'color', 'border-bottom', 'margin', 'text-align', 'font-weight', 'width', 'height', 'line-height', 'background-color']},
      {el: '#export_image .boundary_content .boundary_header p', properties: ['margin', 'margin-block-start', 'margin-block-end']},
			{el: '#export_image .vertex_content', properties: ['font-family', 'border-top', 'border-left', 'border-right', 'background']},
			{el: '#export_image .content_header_name', properties: ['height', 'border-bottom']},
      {el: '#export_image .content_header_name .header_name', properties: ['padding', 'margin', 'text-align', 'border-bottom', 'font-weight', 'font-size']},
      {el: '#export_image .vertex_data', properties: ['font-size']},
      {el: '#export_image .vertex_data .property', properties: ['border-bottom', 'display', 'width', 'font-weight']},
			{el: '#export_image .vertex_data .property .key', properties: ['width', 'margin-left', 'max-width', 'font-weight', 'margin-bottom']},
      {el: '#export_image .vertex_data .property .data', properties: ['width', 'margin-left', 'margin-right', 'border', 'max-width', 'font-weight', 'margin-bottom']},
		]
	}

	/**
	 * Apply css were defined from getStylingList function
	 * @param {*} elements 
	 */
	addInlineStyling(elements) {
		if(elements && elements.length) {
			elements.forEach(function(d) {
				d3.selectAll(d.el).each(function() {
					const element = this;
					if(d.properties && d.properties.length) {
						d.properties.forEach(function(prop) {
							const computedStyle = getComputedStyle(element, null);
							let value = computedStyle.getPropertyValue(prop);

							if (prop == 'height') {
								if (element.className == 'content_header_name')
									value = (parseInt(value.replace('px', ''))  - 2) + 'px';
								else
									value = (parseInt(value.replace('px', ''))  - 1) + 'px';
							}
								
							element.style[prop] = value;
						});
					}
				 });
			});
		}
	}
	
	/**
	 * Save SVG to image
	 */
	saveToImage() {
    // this.downloadSvg($('svg')[0], 'test.png');
    // return;

    if (this.isScreenLoaded()) {
      this.exportImageFromLoadedData();
    } else {
      window.errorMsg('Please load data to generate image !');
    }
  }
  
  async exportImageFromLoadedData() {
    const $loader = $('<div>');
    $loader.attr('id', 'loader');
    $loader.text('Loading...');
    $('body').append($loader);

    let fileName = $('.list-group-item.active').text();
    let fileNameNoExtension = fileName.substring(0, fileName.lastIndexOf('.'));

    this.doSaveToImage(fileNameNoExtension + ".png");

    hideFileChooser();
  }

  async exportImageFromFile() {
    const filePaths = '';

    if (!filePaths) {
      return;
    }

    // Show page loader 
    const $loader = $('<div>');
    $loader.attr('id', 'loader');
    $loader.text('Loading...');
    $('body').append($loader);

    const filePath = filePaths[0];
    const fileName = path.basename(filePath);
    const fileNameNoExtension = fileName.substring(0, fileName.lastIndexOf('.'));
    const imageFilePath = filePath.substring(0, filePath.lastIndexOf(fileName)) + fileNameNoExtension + '.png';

    this.loadRouteConfigForGenerate({content: fileContent});
    await this.saveToImageForGenerate(imageFilePath);
    this.clearAllForGenerate();

    $('#loader').remove();
  }

	doSaveToImage(filePath) {
		const {width, height} = $(`#${this.graphSvgId}`).get(0).getBoundingClientRect();

    let html = d3.select(`#${this.graphSvgId}`).node().outerHTML;

		//Create dummy div for storing html that needed to be export
		d3.select('body')
			.append('div')
			.attr('id', 'export_image')
			.html(html);

		d3.select('#export_image svg')
			//.attr('xmlns', 'http://www.w3.org/2000/svg')
			.attr('width', width)
      .attr('height', height)
      .style('background-color', '#FFFFFF');
			
		//Appy css was defined
		this.addInlineStyling(this.getStylingList());

		//Adding padding-left 2.5px for each first &nbsp; because it has an error while exporting with &nbsp;
		$('#export_image .vertex_data .property .key').each(function() {
			const innerHTML = this.innerHTML;

			if (innerHTML != '') {
				let nCount = 0;
				const arr = innerHTML.split('&nbsp;');

				for (let i = 0; i < arr.length; i++) {
					if (arr[i] == '') nCount++;
					else break;
				}

				if (nCount > 0) {
					$(this).css('padding-left', nCount * 2.5);
				}
			}
		});

    const svgAsXML = (new XMLSerializer).serializeToString($(`#export_image svg`).get(0));

		//Remove dummy div
		d3.select('#export_image').remove();

		d3.select('body')
			.append('canvas')
			.attr('width', width)
			.attr('height', height);

    const canvas = $('canvas').get(0);
		const	context = canvas.getContext('2d');

		const image = new Image;
    image.src = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);
    
		image.onload = () => {
      context.drawImage(image, 0, 0);
      
      const byteString = atob(document.querySelector('canvas').toDataURL().replace(/^data:image\/(png|jpg);base64,/, ''));
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }

      saveRouteImage(filePath, ia);
	
			d3.select('canvas').remove();
			$('#loader').remove();
		}
  }

  async saveToImageForGenerate(filePath, mode) {
    return new Promise((resolve, reject) => {
      const {width, height} = $(`#dummy_${this.graphSvgId}`).get(0).getBoundingClientRect();

      let html = d3.select(`#dummy_${this.graphSvgId}`).node().outerHTML;

      //Create dummy div for storing html that needed to be export
      d3.select('body')
        .append('div')
        .attr('id', 'export_image')
        .html(html);

      d3.select('#export_image svg')
        //.attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .style('background-color', '#FFFFFF');
        
      //Appy css was defined
      this.addInlineStyling(this.getStylingList());

      //Adding padding-left 2.5px for each first &nbsp; because it has an error while exporting with &nbsp;
      $('#export_image .vertex_data .property .key').each(function() {
        const innerHTML = this.innerHTML;

        if (innerHTML != '') {
          let nCount = 0;
          const arr = innerHTML.split('&nbsp;');

          for (let i = 0; i < arr.length; i++) {
            if (arr[i] == '') nCount++;
            else break;
          }

          if (nCount > 0) {
            $(this).css('padding-left', nCount * 2.5);
          }
        }
      })

      const svgAsXML = (new XMLSerializer).serializeToString($(`#export_image svg`).get(0));

      //Remove dummy div
      d3.select('#export_image').remove();

      d3.select('body')
        .append('canvas')
        .attr('width', width)
        .attr('height', height);

      const canvas = $('canvas').get(0);
      const	context = canvas.getContext('2d');

      const image = new Image;
      image.src = 'data:image/svg+xml,' + encodeURIComponent(svgAsXML);
      image.onload = async () => {
        context.drawImage(image, 0, 0);
    
        const byteString = atob(document.querySelector('canvas').toDataURL().replace(/^data:image\/(png|jpg);base64,/, ''));
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }

        if (mode == 'diagram') {
          this.generateDiagramData.push({
            content : document.querySelector('canvas').toDataURL().replace(/^data:image\/(png|jpg);base64,/, '')
          });
        }
        else {
          saveRouteImage(filePath, ia);
        }
          
        d3.select('canvas').remove();

        resolve(true);
      }
    });
  }

	binaryblob() {
    const byteString = atob(document.querySelector('canvas').toDataURL().replace(/^data:image\/(png|jpg);base64,/, ''));
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);
		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
    }
    
		const dataView = new DataView(ab);
		const blob = new Blob([dataView], {type: 'image/png'});
		const DOMURL = self.URL || self.webkitURL || self;
		const newurl = DOMURL.createObjectURL(blob);
	
		return newurl;
  }

  drawObjects(data) {
    //clear data
		this.clearAll();
    this.edgeMgmt.clearAll();

    const { boundary: boundaries, vertex: vertices, edge } = data;
    
		// Draw boundary
		boundaries.forEach(e => {
			this.boundaryMgmt.create(e);
		})
		// Draw vertex
		vertices.forEach(e => {
			this.vertexMgmt.create(e);
		})

		edge.forEach(e =>{ 
			this.edgeMgmt.create(e);
		})
    
		if (this.dataContainer.boundary && this.dataContainer.boundary.length > 0) {
			this.objectUtils.setAllChildrenToShow(this.dataContainer);
			if (this.dataContainer.boundary.length > 0)
        this.objectUtils.updateHeightBoundary(this.dataContainer);
    }
    
    setMinBoundaryGraph(this.dataContainer,this.graphSvgId, this.viewMode.value);

    hideFileChooser();
  }

  drawObjectsForGenerate(dataContainer) {
    const { boundary: boundaries, vertex: vertices, edge } = dataContainer;
    
		// Draw boundary
		boundaries.forEach(e => {
			this.dummyBoundaryMgmt.create(e);
    });
    
		// Draw vertex
		vertices.forEach(e => {
			this.dummyVertexMgmt.create(e);
		});

		edge.forEach(e => { 
			this.dummyEdgeMgmt.create(e);
    });
    
    setMinBoundaryGraph(this.dummyDataContainer, `dummy_${this.graphSvgId}`, this.viewMode.value);
  }
  
  isScreenLoaded() {
    return this.dataContainer.vertex.length > 0;
  }

  readAllYamlFiles(dirPath) {
    let data = [];
    return data;
  }

  setFontSize(dataElementFontSize) {
    let fontSize = parseInt(dataElementFontSize);
    if (fontSize < 8) fontSize = 8;

    this.boundaryMgmt.setFontSize(fontSize);
    this.vertexMgmt.setFontSize(fontSize);

    this.objectUtils.updateHeightBoundary(this.dataContainer);

    setMinBoundaryGraph(this.dataContainer, this.svgId, this.viewMode.value);
  }
}

export default CltRouteDiagram;