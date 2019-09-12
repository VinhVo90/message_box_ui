import _ from 'lodash';
import { copyToClipboard } from '../../../common/utilities/common.util';

class CopyValueMenu {
  constructor(props) {
    this.selector = props.selector;
    this.initVertexMenu();
  }

  initVertexMenu() {
    $.contextMenu({
      selector: this.selector,
      zIndex: 100,
      build: () => ({
        callback: (key, options) => {
          switch (key) {
            case 'copyValue':
              const value = options.$trigger.find('.data')[0].innerText;
              copyToClipboard(value);
              break;

            default:
              break;
          }
        },
        items: {
          copyValue: {
            name: 'Copy Value',
            icon: 'fa-files-o'
          }
        },
      }),
    });
  }
}

export default CopyValueMenu;
