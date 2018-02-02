module.exports = {
  max_length: {
    defaultValue: 100,
    label: 'Max length',
    hint: 'Maximum allowed characters count to input in the field.'
  },
  min_length: {
    defaultValue: '',
    label: 'Min length',
    hint: 'Minimum allowed characters count to input in the field. Live this field empty if empty value is allowed.'
  },
  textarea: {
    defaultValue: false,
    label: 'Textarea',
    hint: 'Input area controll type. Set checkbox if multiline input text area is required.'
  },
  placeholder: {
    defaultValue: '',
    label: 'Placeholder',
    hint: 'Input field placeholder value.'
  },
  max_value: {
    defaultValue: 30000,
    label: 'Max value',
    hint: 'Max allowed number to input.'
  },
  min_value: {
    defaultValue: 0,
    label: 'Min value',
    hint: 'Min allowed number to input.'
  },
  min_selected: {
    defaultValue: 1,
    label: 'Min selected',
    hint: 'Minimum required selected items.'
  },
  max_selected: {
    defaultValue: 3,
    label: 'Max selected',
    hint: 'Maximum allowed selected items.'
  },
  allow_custom: {
    defaultValue: false,
    label: 'Allow custom item add',
    hint: 'Set checkox to allow custom item add.'
  },
  item_name: {
    defaultValue: 'Item',
    label: 'Custom Add <Item>',
    hint: 'i.e. "Category", "Event", "Special Need" etc.'
  },
  list: {
    defaultValue: true,
    label: 'Show as list',
    hint: 'If checkbox is set - list with checks will be shown or badges otherwise.'
  },
  tiles: {
    defaultValue: false,
    label: 'Icons is required',
    hint: 'Set checkbox to assign icon to each list or badge.'
  },
  values: {
    defaultValue: [],
    label: 'Items list',
    hint: 'List of user select items'
  }
};
