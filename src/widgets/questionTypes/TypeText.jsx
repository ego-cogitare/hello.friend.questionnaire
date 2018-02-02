import React from 'react';
import ParamWidget from '../ParamWidget.jsx';

export default class TypeText extends React.Component {

  constructor(props) {
    super(props);

    // Evaluate value params fron strings
    props.questionParams.map((param) => Object.assign(param, { value: eval(param.value) }));

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
