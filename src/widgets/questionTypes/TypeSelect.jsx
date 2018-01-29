import React from 'react';
import ParamWidget from '../ParamWidget.jsx';

export default class TypeSelect extends React.Component {

  constructor(props) {
    super(props);

    // Evaluate value params fron strings
    props.questionParams.forEach((param) => {
      ['item_name'] // Arrays of fields to skip evaluation (string values are allowed)
        .indexOf(param.name) === -1 && Object.assign(param, { value: eval(param.value) });
    });

    this.state = {
      categoryQuestion: props.categoryQuestion,
      questionParams: props.questionParams,
    };

    console.log(this.state.questionParams);
  }

  render() {
    return (
      <div>
        <div class="box-body">
        {
          this.state.questionParams.map((param) => {
            // If allow_custom parameter is changed - need to rerender view to hide
            // or show "Custom Add <Item>" field
            if (param.name === 'allow_custom') {
              return (
                <ParamWidget
                  key={param.id}
                  param={param}
                  onChange={() => this.setState({ questionParams: this.state.questionParams })}
                />
              );
            }
            // Field item_name needs to be shown dependently from "Allow custom item add" field
            if (param.name === 'item_name') {
              // Get "Allow custom item add" parameter value
              const allowCustom = this.state.questionParams.find(({name}) => name === 'allow_custom').value;

              // If custom input not allowed
              if (!allowCustom) return null;
            }
            return <ParamWidget key={param.id} param={param} />;
          })
        }
        </div>
        <div class="box-footer">
          <button type="submit" class="btn btn-primary btn-flat" onClick={() => this.props.onSave(this.state)}>Save</button>
        </div>
      </div>
    );
  }
}
