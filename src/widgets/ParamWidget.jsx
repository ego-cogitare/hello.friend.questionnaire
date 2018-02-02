import React from 'react';
import classNames from 'classnames';
import { Checkbox } from 'react-icheck';
import axios, { post } from 'axios';
import questionParams from '../questionParams';
import { uniqueId } from '../Utils';

export default class ParamWidget extends React.Component {

  constructor(props) {
    super(props);

    // Question params defaults
    this.paramsSettings = questionParams;

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

  addSelectItem() {
    // Obtain new item value
    const newItemValue = this.refs['newItemRef'].value;

    // Do nothing if empty value add
    if (!newItemValue) return false;

    // Add new item to items list
    this.state.param.value.push({
      id: uniqueId(),
      value: newItemValue
    });

    // Clear new item add value
    this.refs['newItemRef'].value = '';

    // Update view
    this.setState({ param: this.state.param });
  }

  onSelectItemIconFormSubmit(e) {
    e.preventDefault();

    post(
      window.paths.fileUpload || '/file/upload',
      new FormData(e.target),
      {headers:{'content-type':'multipart/form-data'}}
    )
    .then(({data}) => {
      // Update select option icon
      this.state.param.value.forEach((item) => {
        (item.id === data.optionId) && Object.assign(item, { icon: data.path })
      });

      // Rerender icons
      this.setState({ param: this.state.param });
    });
  }

  render() {
    switch (this.state.param.name) {
      // List of user select items
      case 'values':
        return (
          <div>
            <label>{this.paramDefLabel(this.state.param.name)}</label>
            { // Display list of items
              (this.state.param.value || []).map((item, i) => {
                return (
                  <div key={item.id} class="clearfix select-list">
                    { // Block renders dependently of "Requires tiles" checkbox set or not
                      this.props.withIcon &&
                      <div class="pull-left" onClick={() => $(this.refs[`icon-select-file-${item.id}`]).trigger('click')}>
                        <form style={{display:'none'}} onSubmit={this.onSelectItemIconFormSubmit.bind(this)}>
                          <input type="hidden" name="optionId" value={item.id} />
                          <input type="hidden" name="currentIcon" value={item.icon} />
                          <input
                            type="file"
                            name="icon"
                            ref={`icon-select-file-${item.id}`}
                            onChange={(e) => {
                              // Save file nane to upload
                              // this.selectItemIconFile = e.target.files[0];

                              // Trigger submit button click to send form
                              $(this.refs[`icon-select-submit-btn-${item.id}`]).trigger('click');
                            }}
                          />
                          <button type="submit" ref={`icon-select-submit-btn-${item.id}`}>Upload</button>
                        </form>
                        { item.icon ?
                            <img width="34" height="34" src={`${window.paths.storagePath || '/'}${item.icon}`} alt={item.icon} style={{marginTop:5}} /> :
                            <i class="fa fa-plus select-list-icon-add"></i> }
                      </div>
                    }
                    <div class={classNames('pull-right input-group', { 'with-icon': this.props.withIcon })} style={{ marginTop:5 }}>
                      <input
                        type="text"
                        class="form-control"
                        value={item.value}
                        placeholder="Item value..."
                        onChange={(e) => {
                          item.value = e.target.value;
                          this.setState({ param: this.state.param });
                        }}
                      />
                      <span class="input-group-btn">
                        <button type="button" class="btn btn-danger btn-flat" onClick={() => {
                            if (!confirm('Are you sure want to delete this item?')) return false;

                            // Remove item from items list
                            this.state.param.value = this.state.param.value.filter(({id}) => id !== item.id);

                            // Update items list
                            this.setState({ param: this.state.param });
                          }}
                        >
                          <i class="fa fa-trash"></i>
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })
            }
            <div class="input-group" style={{ marginTop:5 }}>
              <input
                type="text"
                class="form-control"
                placeholder="Add new item..."
                ref="newItemRef"
                onKeyDown={(e) => e.which === 13 && this.addSelectItem()}
              />
              <span class="input-group-btn">
                <button type="button" class="btn btn-info btn-flat" onClick={this.addSelectItem.bind(this)}
                >
                  <i class="fa fa-plus"></i>
                </button>
              </span>
            </div>
            <p class="help-block">{this.paramDefHint(this.state.param.name)}</p>
          </div>
        );
      break;

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

      default:
        console.error(`Unknown param type: ${this.state.param.name}`);
        return null;
      break;
    }
  }
}
