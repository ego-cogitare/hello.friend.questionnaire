export function request(url, params, type, onSuccess, onFail = ()=>{}) {
  let result = jQuery.ajax({
      url,
      data: params,
      dataType: 'json',
      type,
      crossDomain: true,
      xhrFields: {
        withCredentials: true
      }
  });

  return (typeof onSuccess === 'undefined') ? result :
    result
      .done(onSuccess)
      .fail(onFail);
};
