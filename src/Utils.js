export function uniqueId() {
  return Number('1' + Date.now().toString().substr(6, 9));
};
