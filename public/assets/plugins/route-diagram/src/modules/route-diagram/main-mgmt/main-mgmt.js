import FileMgmt from '../file-mgmt/file-mgmt';
import CltRouteDiagram from '../../../components/clt-route-diagram/clt-route-diagram';
import { VIEW_MODE } from '../../../common/const/index';

class MainMgmt {
	constructor() {
		const options = {
			selector: $('#algetaContainer'),
			viewMode: VIEW_MODE.ROUTE_DIAGRAM,
			mandatoryDataElementConfig: {
				mandatoryEvaluationFunc: (dataElement) => {
					if (!dataElement) return false;
					if (dataElement.usage === undefined && dataElement.mandatory === undefined) return false;
					if (dataElement.usage !== undefined && dataElement.usage !== '' && dataElement.usage !== 'M') return false;
					if (dataElement.mandatory !== undefined && !dataElement.mandatory) return false;
	
					return true;
				},
				colorWarning: '#ff8100', // Orange
				colorAvailable: '#5aabff' // Light blue
			}
		}

		this.CltRouteDiagram = new CltRouteDiagram(options);

		/**
     * Init file mgmt
     */
		new FileMgmt({
			parent: this
    });
	}

	/**
   * Validation data input match structure of graph data
   * @param data
   * @param option
   */
	separateDataToManagement(data, option, fileName) {
		if (option === 'SEGMENT_SET') {
			this.CltRouteDiagram.LoadVertexDefinition(data, fileName);
		} else if (option === 'MESSAGE_SPEC') {
			this.CltRouteDiagram.loadGraphData(data, fileName);
		} else if (option === 'ROUTE_CONFIG') {
			this.CltRouteDiagram.loadScreen(data);
		}
	}

	save() {
		this.CltRouteDiagram.save();
	}

	/**
   * Set mode graph is enable or disable edit
   * @param modeGraph
   */
	setGraphMode(modeGraph) {
		const viewMode = modeGraph === 'S' ? VIEW_MODE.SHOW_ONLY : VIEW_MODE.EDIT;
		this.CltRouteDiagram.setViewMode(viewMode);
  }

  saveToImage(fileName) {
		this.CltRouteDiagram.saveToImage(fileName);
  }
  
  generateDiagram() {
    this.CltRouteDiagram.generateDiagram();
  }
}
export default MainMgmt;
