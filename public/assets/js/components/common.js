function successMsg(msg) {
  swal(
    'Success!',
    `${msg}`,
    'success'
  )
}

function infoMsg(msg) {
  swal(
    'Infomation',
    `${msg}`,
    'info'
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

/**
 * Validate DOM
 * @param {*} el 
 * @param {*} options 
 */
function validateControl(el, options) {
  const { name, message, regex, required, errorType, focus, select } = options;

  const $el = $(el);
  const value = el.innerHTML.trim();
  
  if (required === true) {
    if (value === "") {
      toastr.error(`Please enter ${name}.`);

      if (select === true) $el.select();
      else if (focus === true) $el.focus();

      return false;
    }
  }

  if (regex !== undefined) {
    if (!regex.test(value)) {
      if (message !== undefined) {
        toastr.error(message);;
      } else {
        toastr.error(`${name} is incorrect format`);
      }
      
      if (select === true) $el.select();
      else if (focus === true) $el.focus();
      
      return false;
    }
  }

  return true;
}

function convertLocalTimeToUTCTime(localTimeStamp) {
  return localTimeStamp + new Date().getTimezoneOffset() * 60000;
}

function convertUTCTimeToLocalTime(utcTimeStamp) {
  return utcTimeStamp - new Date().getTimezoneOffset() * 60000;
}