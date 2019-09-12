function successMsg(msg) {
  swal(
    'Success!',
    `${msg}`,
    'success'
  )
}

function errorMsg(msg) {
  swal(
    'Error',
    `${msg}`,
    'error'
  )
}

function warningMsg(msg) {
  swal(
    'Warning!!',
    msg,
    'warning'
  )
}

function warningMsgAndFocus(msg, action) {
  swal(
    'Warning!!',
    msg,
    'warning'
  ).then(function () {
    if (action) {
      action((msg) => {
        successMsg(msg || '')
      })
    }
  });
}

function confirmSave(action, title) {
  swal({
    title: title || 'Do you want to save?',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel!',
    confirmButtonClass: 'btn btn-success',
    cancelButtonClass: 'btn btn-danger',
    buttonsStyling: false
  }).then(function () {
    if (action) {
      action((msg) => {
        successMsg(msg || '')
      })
    }
  });
}

function confirmDelete(action, title) {
  swal({
    title: title || 'Do you want to delete?',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel!',
    confirmButtonClass: 'btn btn-success',
    cancelButtonClass: 'btn btn-danger',
    buttonsStyling: false
  }).then(function () {
    if (action) {
      action((msg) => {
        successMsg(msg || '')
      })
    }
  });
}
