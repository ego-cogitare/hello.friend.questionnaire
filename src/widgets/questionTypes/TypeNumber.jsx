import React from 'react';
import ParamWidget from '../ParamWidget.jsx';

export default class TypeNumber extends React.Component {

  constructor(props) {
    super(props);

    // Evaluate value params fron strings
    props.questionParams.map((param) => Object.assign(param, { value: eval(param.value) }));

    this.state = {
      categoryQuestion: props.categoryQuestion,
      questionParams: props.questionParams,
    };

    console.log('number', this.state);
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
