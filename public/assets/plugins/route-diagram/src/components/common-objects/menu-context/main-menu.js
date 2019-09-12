import _ from 'lodash';
import { getCoorMouseClickRelativeToParent, checkModePermission } from '../../../common/utilities/common.util';
import State from '../../../common/new-type-define/state';

class MainMenu {
  constructor(props) {
    this.selector = props.selector;
    this.containerId = props.containerId;
    this.parent = props.parent;
    this.vertexDefinition = props.vertexDefinition;
    this.viewMode = props.viewMode;
    this.history = props.history;

    this.initMainMenu();
  }

  initMainMenu() {
    // Main menu config
    $.contextMenu({
      selector: this.selector,
      autoHide: true,
      zIndex: 100,
      build: () => ({
        callback: (key, options) => {
          switch (key) {
            case 'createBoundary':
              const params = {
                x: this.opt.x,
                y: this.opt.y,
                isMenu: this.opt.isMenu,
              };
              this.parent.createBoundary(params);
              break;

            case 'clearAll':
              const state = new State();
              this.parent.edgeMgmt.clearAll(state);
              this.parent.clearAll(state);

              if (this.history) {
                this.history.add(state);
              }
              break;

            case 'autoAlignment':
              this.parent.autoAlignment();
              break;

            case 'showReduced':
              this.parent.isShowReduced ? this.parent.showFull() : this.parent.showReduced();
              break;

            default:
              break;
          }
        },
        items: {
          createVertex: {
            name: 'Create Vertex',
            icon: 'fa-window-maximize',
            items: this.loadRouteItemsSub1(),
          },
          sep1: '-',
          createBoundary: {
            name: 'Create Boundary',
            icon: 'fa-object-group',
            disabled: !checkModePermission(this.viewMode.value, 'createBoundary'),
          },
          sep2: '-',
          clearAll: {
            name: 'Clear All',
            icon: 'fa-times',
            disabled: !checkModePermission(this.viewMode.value, 'clearAll'),
          },
          sep3: '-',
          autoAlignment: {
            name: 'Auto Alignment',
            icon: 'fa-sort',
            disabled: !checkModePermission(this.viewMode.value, 'autoAlignment'),
          },
          sep4: '-',
          showReduced: {
            name: this.parent.isShowReduced ? 'Show Full' : 'Show Reduced',
            icon: 'fa-link',
            disabled: !checkModePermission(this.viewMode.value, 'showReduced'),
          },
        },
        events: {
          show: (opt) => {
            //if (!event) { return; }

            const { x, y } = getCoorMouseClickRelativeToParent(opt, this.containerId);
            opt.x = x;
            opt.y = y;
            opt.isMenu = true;
            this.opt = opt;
          },
        },
      }),
    });
  }

  /**
   * Generate verties from array vertexTypes
   */
  loadRouteItemsSub1() {
    const { SOURCE, INPUT_BACKUP, OUTPUT_BACKUP, DESTINATION, FILTERS, CONVERTERS } = this.parent.defaultRouteConfig();

    const subItems = {
      source: {
        name: 'SOURCE',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('SOURCE', SOURCE),
      },
      sep1: '-',
      filters: {
        name: 'FILTERS',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('FILTERS', FILTERS),
      },
      sep2: '-',
      input_backup: {
        name: 'INPUT_BACKUP',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('INPUT_BACKUP', INPUT_BACKUP),
      },   
      sep3: '-',   
      converters: {
        name: 'CONVERTERS',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('CONVERTERS', CONVERTERS),
      },
      sep4: '-',
      ouput_backup: {
        name: 'OUTPUT_BACKUP',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('OUTPUT_BACKUP', OUTPUT_BACKUP),
      },
      sep5: '-',
      destination: {
        name: 'DESTINATION',
        icon: 'fa-window-maximize',
        items: this.loadRouteItemsSub2('DESTINATION', DESTINATION),
      }
    };

    const dfd = jQuery.Deferred();
    setTimeout(() => {
      dfd.resolve(subItems);
    }, 10);
    return dfd.promise();
  }

  loadRouteItemsSub2(subName, itemsData) {
    let items = {};

    let optionsObject;
    let propertyName;
    if (itemsData.protocol) {
      optionsObject =itemsData.protocol;
      propertyName = 'protocol';
    } else {
      optionsObject =itemsData.type;
      propertyName = 'type';
    }

    let options = {};
    for (let op in optionsObject) {
      if (op === 'description') continue;

      options[`${subName}.${propertyName}.${op}`] = op;
    }

    items.isHtmlItem = {
      placeholder: 'Type to search',
      type: 'text',
      value: '',
      events: {
        keyup: this.searchVertexType(),
      },
    };

    items.sep1 = '-';

    items.select = {
      type: 'select',
      size: 10,
      options,
      events: {
        dblclick: this.onSelectVertex(this),
      },
      events2: {
        enter: this.onSelectVertex(this),
      },
    }

    const dfd = jQuery.Deferred();
    setTimeout(() => {
      dfd.resolve(items);
    }, 10);
    return dfd.promise();
  }

  searchVertexType() {
    return function () {
      const filter = this.value.toUpperCase();
      const $select = $(this).closest('ul').find('select');
      const options = $select.find('option');
      // Remove first li cause it is input search
      const length = options.length;
      for (let i = 0; i < length; i += 1) {
        const element = options[i];
        const value = $(element).val();
        if (value.toUpperCase().indexOf(filter) > -1) {
          $(element).css('display', '');
        } else {
          $(element).css('display', 'none');
        }
      }

      $select[0].selectedIndex = -1;
      $select[0].value = '';
    };
  }

  onSelectVertex(self) {
    return function () {
      if (this.selectedIndex === -1) return;

      // routeType.propertyName.itemType
      // ex: SOURCE.protocol.DIR
      const selectedInfo = this.value.split('.');
      const routeData = self.parent.defaultRouteConfig();
      const itemData = routeData[selectedInfo[0]][selectedInfo[1]][selectedInfo[2]];
      let data = [];
      data.push({
        usage: 'M',
        name: selectedInfo[1],
        value: selectedInfo[2],
        description: routeData[selectedInfo[0]][selectedInfo[1]].description
      });

      for (let prop in itemData) {
        data.push({
          usage: itemData[prop].usage,
          name: prop,
          value: '',
          description: itemData[prop].description
        });
      }

      const params = {
        x: self.opt.x,
        y: self.opt.y,
        isMenu: self.opt.isMenu,
        vertexType: selectedInfo[0],
        groupType: 'SEGMENT',
        name: selectedInfo[0],
        data: data
      };

      self.parent.createVertex(params);
      $(`${self.selector}`).contextMenu('hide');
    };
  }
}

export default MainMenu;
