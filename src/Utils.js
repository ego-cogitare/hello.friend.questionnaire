export function getParam(hayStack, paramName) {
  const param = hayStack.find(({name}) => name === paramName);
  if (!param) {
    console.error(`getParam: parameter ${paramName} not found`);
    return false;
  }
  return param;
};

export function updateParam(hayStack, paramName, paramValue) {
  const param = hayStack.find(({name}) => name === paramName);
  if (!param) {
    console.error(`updateParam: parameter ${paramName} not found`);
    return false;
  }
  return Object.assign(param, { value: paramValue });
};
