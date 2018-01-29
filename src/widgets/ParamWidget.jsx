import React from 'react';
import { Checkbox } from 'react-icheck';

export default class ParamWidget extends React.Component {

  constructor(props) {
    super(props);

    this.paramsSettings = {
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

    this.state = {
      param: this.props.param
    };
  }

  paramDefVal(paramName) {
    return this.paramsSettings[paramName].defaultValue;
  }

  paramDefLabel(paramName) {
    return this.paramsSettings[paramName].label;
  }

  paramDefHint(paramName) {
    return this.paramsSettings[paramName].hint;
  }

  render() {
    switch (this.state.param.name) {
      // Numeric/Null - max and min length of requeired text
      case 'max_length':
      case 'min_length':
      case 'max_value':
      case 'min_value':
      case 'max_selected':
      case 'min_selected':
        return (
          <div>
            <label>{this.paramDefLabel(this.state.param.name)}</label>
            <div class="form-group no-margin">
              <input
                type="number"
                class="form-control"
                value={this.state.param.value || this.paramDefVal(this.state.param.name)}
                onChange={(e) => {
                  this.state.param.value = e.target.value;
                  this.setState({ param: this.state.param });
                }}
              />
              <p class="help-block">{this.paramDefHint(this.state.param.name)}</p>
            </div>
          </div>
        );
      break;

      // Boolean (use textarea for text input or not)
      case 'textarea':
      case 'allow_custom':
      case 'tiles':
      case 'list':
        return (
          <div>
            <label>{this.paramDefLabel(this.state.param.name)}</label>
            <div class="form-group no-margin">
              <Checkbox
                checkboxClass="icheckbox_square-blue"
                increaseArea="20%"
                checked={Boolean(this.state.param.value)}
                onChange={(e) => {
                  this.state.param.value = !e.target.checked;
                  this.setState({ param: this.state.param });

                  // If onChange callback provided - fire it!
                  this.props.onChange && this.props.onChange(e);
                }}
              />
              <p class="help-block">{this.paramDefHint(this.state.param.name)}</p>
            </div>
          </div>
        );
      break;

      case 'placeholder':
      case 'item_name':
        return (
          <div>
            <label>{this.paramDefLabel(this.state.param.name)}</label>
            <div class="form-group no-margin">
              <input
                type="text"
                class="form-control"
                value={this.state.param.value || this.paramDefVal(this.state.param.name)}
                onChange={(e) => {
                  this.state.param.value = e.target.value;
                  this.setState({ param: this.state.param });
                }}
              />
              <p class="help-block">{this.paramDefHint(this.state.param.name)}</p>
            </div>
          </div>
        );
      break;

      case 'values':
        return (
          <div>
            <label>{this.paramDefLabel(this.state.param.name)}</label>
            <div class="form-group no-margin">
              <input type="text" class="form-control" defaultValue="Item #1" placeholder="Item value" />
            </div>
            <div class="form-group no-margin">
              <input type="text" class="form-control" defaultValue="Item #2" placeholder="Item value" />
            </div>
            <div class="form-group no-margin">
              <input type="text" class="form-control" defaultValue="Item #3" placeholder="Item value" />
              <p class="help-block">{this.paramDefHint(this.state.param.name)}</p>
            </div>
          </div>
        );
      break;

      default:
        console.error(`Unknown param type: ${this.state.param.name}`);
        return null;
      break;
    }
  }
}
