
function initDatatable(idTable, options, onRowClick) {
    let tbId = idTable
    if (window.app && window.app.$datatable) {
        window.app.$datatable.destroy()
        $(`${tbId}`).empty()
    }

    let defaultOptions = _.assign({
        order: [
            [1, 'desc']
        ],
        iDisplayLength: 100,
        bLengthChange: false,
        columns: [],
        data: [],
    }, options)

    let $datatable = $(`${tbId}`).DataTable(defaultOptions)

    $(`${tbId} tbody`)
        .on('click', 'tr', function () {
            if (!$(this).hasClass('selected')) {
                $datatable.$('tr.selected').removeClass('selected')
                $(this).addClass('selected')
            }

            window.selectedIndex = $(`${tbId} tbody tr.selected`).index()
            if (onRowClick) {
                onRowClick(window.selectedIndex, $datatable.row(this).data())
            }
        }).on("dblclick", "tr", function () {
            if (!$(this).hasClass('selected')) {
                $datatable.$('tr.selected').removeClass('selected')
                $(this).addClass('selected')
            }

            window.selectedIndex = $(`${tbId} tbody tr.selected`).index()
            if (window.app.onRowDblClick) {
                window.app.onRowDblClick(window.selectedIndex, $datatable.row(this).data())
            }
        })

    window.app.$datatable = $datatable

    setTimeout(() => {
        $(`${tbId} tbody tr:nth-child(${window.selectedIndex + 1})`).click()
    })

    return $datatable
}

function setDbClickTable(tbId, event){
    let $datatable = `${tbId}`
    $(`${tbId} tbody`).on("dblclick", "tr", function () {
        // if (!$(this).hasClass('selected')) {
        //     $datatable.$('tr.selected').removeClass('selected')
        //     $(this).addClass('selected')
        // }

        window.selectedIndex = $(`${tbId} tbody tr.selected`).index()
        if (window.app.onRowDblClick) {
            var $this = $(this);
            var row = $this.closest("tr");
            window.app.onRowDblClick(window.selectedIndex, row)
        }
    })

window.app.$datatable = $datatable
}