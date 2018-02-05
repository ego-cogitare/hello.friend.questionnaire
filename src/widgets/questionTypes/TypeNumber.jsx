import React from 'react';
import ParamWidget from '../ParamWidget.jsx';

export default class TypeNumber extends React.Component {

  constructor(props) {
    super(props);

    // Evaluate value params fron strings
    props.questionParams.forEach((param) => {
      ['placeholder'] // Arrays of fields to skip evaluation (string values are allowed)
        .indexOf(param.name) === -1 && Object.assign(param, { value: eval(param.value) });
    });

    this.state = {
      categoryQuestion: props.categoryQuestion,
      questionParams: props.questionParams,
    };
  }

  render() {
    return (
      <div class="box-body">
      {
        this.state.questionParams.map((param) => (
          <ParamWidget key={param.id} param={param} />
        ))
      }
      </div>
    );
  }
}
