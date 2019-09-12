import { readDataFileJson, readYamlFile, allowInputNumberOnly, hideFileChooser } from '../../../common/utilities/common.util';
import { BOUNDARY_ATTR_SIZE, VERTEX_ATTR_SIZE } from '../../../common/const';

const ID_FOLDER_OPEN_FILE_MGMT = 'folderOpenFileMgmt';
const ID_CONTAINER_FILE_MGMT = 'containerFileMgmt';
const ID_OPTION_FILE_TYPE_INPUT = 'optionFileTypeInput';
const ID_INPUT_FILE_DATA = 'inputFileData';
const GROUP_OPTION_MODE_GRAPH = 'input:radio[name=graphMode]';
const ID_OUTPUT_FILE_NAME = 'outputFileName';
const ID_BUTTON_SAVE = 'btnSave';
const ID_BUTTON_BROWN = 'btnBrown';
const ID_BUTTON_LOAD = 'btnLoad';
const ID_OPTION_CONFIG = 'optionConfig';
const ID_INPUT_CONFIG = 'inputConfig';
const ID_BUTTON_EXPORT_IMAGE = 'btnExportImage';
const ID_BUTTON_GENERATE = 'btnGenerate';

class FileMgmt {
	constructor(props) {
		this.parent = props.parent;
    this.initButtonEvent();
    this.onLoad();
  }
  
  onLoad() {
    $(`#${ID_INPUT_CONFIG}`).val(BOUNDARY_ATTR_SIZE.PADDING);
  }

	initButtonEvent() {
		$(`#${ID_FOLDER_OPEN_FILE_MGMT}`).click(() => {
			$(`#${ID_CONTAINER_FILE_MGMT}`).slideToggle();
		});

		$(`#${ID_OPTION_FILE_TYPE_INPUT}`).change(event => {
			$(`#${ID_INPUT_FILE_DATA}`).val('');
		});

		// Handle event change value on group radio Mode
		$(GROUP_OPTION_MODE_GRAPH).change((event) => {
			const modeGraph = event.target.value;
			this.parent.setGraphMode(modeGraph);
		});

		// Handle event click on button Download
		$(`#${ID_BUTTON_SAVE}`).click((event) => {
			this.parent.save();
    });
    
    $(`#${ID_BUTTON_EXPORT_IMAGE}`).click(()=>{
			const fileName = $(`#${ID_OUTPUT_FILE_NAME}`).val();
			if (this.parent.saveToImage(fileName)) {
				hideFileChooser();
			}
    });
    
    $(`#${ID_BUTTON_GENERATE}`).click(() => {
      this.parent.generateDiagram();
    });

		// Handle event press enter on input file name
		$(`#${ID_OUTPUT_FILE_NAME}`).keypress((event) => {
			if (event.keyCode == 13) {
				const fileName = $(`#${ID_OUTPUT_FILE_NAME}`).val();
				this.parent.save(fileName);
				event.preventDefault();
			}
    });
    
    $(`#${ID_BUTTON_BROWN}`).click(() => {
      const dirPaths = '';

      if (!dirPaths) return;

      $(`#${ID_INPUT_FILE_DATA}`).val(dirPaths[0]);
    });

		$(`#${ID_BUTTON_LOAD}`).click(() => {
      const dirPath = window.app.selectedFile.path;

      if ('' === dirPath) return;

      fetch('/api/readYamlFile', {
        method: 'POST',
        body: JSON.stringify({path : dirPath}),
        headers:{
          'Content-Type': 'application/json'
        }
      }).then(res => res.json())
      .then(data => {
        if (data.length === 0) return;
        const options = $(`#${ID_OPTION_FILE_TYPE_INPUT}`).val();
        this.parent.separateDataToManagement(data, options, "");
      })
      .catch(error => console.error('Error:', error))
    });
    
    $(`#${ID_OPTION_CONFIG}`).change(event => {
      if ($(`#${ID_OPTION_CONFIG}`).val() === 'PADDING') {
        $(`#${ID_INPUT_CONFIG}`).val(BOUNDARY_ATTR_SIZE.PADDING);
      } else if ($(`#${ID_OPTION_CONFIG}`).val() === 'CHILD_MARGIN') {
        $(`#${ID_INPUT_CONFIG}`).val(BOUNDARY_ATTR_SIZE.CHILD_MARGIN);
      } else if ($(`#${ID_OPTION_CONFIG}`).val() === 'HEADER_FONT_SIZE') {
        $(`#${ID_INPUT_CONFIG}`).val(VERTEX_ATTR_SIZE.HEADER_NAME_FONT_SIZE);
      } else if ($(`#${ID_OPTION_CONFIG}`).val() === 'DATA_ELEMENT_FONT_SIZE') {
        $(`#${ID_INPUT_CONFIG}`).val(VERTEX_ATTR_SIZE.DATA_ELEMENT_FONT_SIZE);
      }
    });
    
    $(`#${ID_INPUT_CONFIG}`).change(event => {
      if ($(`#${ID_INPUT_CONFIG}`).val() === '') $(`#${ID_INPUT_CONFIG}`).val('0');

      if ($(`#${ID_OPTION_CONFIG}`).val() === 'PADDING') {
        this.parent.CltRouteDiagram.setBoundaryPadding($(`#${ID_INPUT_CONFIG}`).val());
      } else if ($(`#${ID_OPTION_CONFIG}`).val() === 'CHILD_MARGIN') {
        this.parent.CltRouteDiagram.setBoundaryChildMargin($(`#${ID_INPUT_CONFIG}`).val());
      } else if ($(`#${ID_OPTION_CONFIG}`).val() === 'DATA_ELEMENT_FONT_SIZE') {
        this.parent.CltRouteDiagram.setFontSize($(`#${ID_INPUT_CONFIG}`).val());
      }
    });
    
    $(`#${ID_INPUT_CONFIG}`).keydown(event => {
      allowInputNumberOnly(event);
    });
	}

	/**
   * Read content file Vertex Type Definition
   * or  read content file Graph Data Structure
   * @param event
   */
	async readFile() {
		const file = $(`#${ID_INPUT_FILE_DATA}`)[0].files[0];
		if (!file)
      return;
      
    const options = $(`#${ID_OPTION_FILE_TYPE_INPUT}`).val();

    let data;
    if (options == "ROUTE_CONFIG") {
      data = await readYamlFile(file);
    } else {
      data = await readDataFileJson(file);
    }

		if (!data)
			return;

		this.parent.separateDataToManagement(data, options, file.name);
	}

	clearInputFile() {
		$(`#${ID_INPUT_FILE_DATA}`).val(null);
	}

	clearOutFileName() {
		$(`#${ID_OUTPUT_FILE_NAME}`).val(null);
	}
}

export default FileMgmt
