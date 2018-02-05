import React from 'react';
import ParamWidget from '../ParamWidget.jsx';
import classNames from 'classnames';

export default class TypeChildren extends React.Component {

  constructor(props) {
    super(props);

    // Evaluate value params from strings
    props.questionParams.forEach((param) => {
      // If somehow we receive empty value instead of values serialized ata
      if (param.name === 'values' && !param.value) {
        param.value = [];
        return false;
      }

      ['item_name'] // Arrays of fields to skip evaluation (string values are allowed)
        .indexOf(param.name) === -1 && Object.assign(param, { value: eval(param.value) });
    });

    this.state = {
      categoryQuestion: props.categoryQuestion,
      questionParams: props.questionParams,
    };

    console.log('Children widget state:', this.state);
  }

  /**
   * Expand/collapse question edit form
   */
  onQuestionEdit(question, e) {
    e.preventDefault();
    e.stopPropagation();
    Object.assign(question, { isExpanded: !question.isExpanded });
    this.setState({ categoryQuestion: this.state.categoryQuestion });
  }

  render() {
    return (
      <div class="box-body">
        {
          this.state.categoryQuestion.question.questions.map((question) => (
            <div key={question.id} class={classNames('box box-solid box-primary', {'collapsed-box': !question.isExpanded })}>
              <div class="box-header with-border">
                <h3 class="box-title">{question.name}</h3>
                  <div class="box-tools pull-right">
                    <button type="button" class="btn btn-box-tool" onClick={this.onQuestionEdit.bind(this, question)}><i class="fa fa-pencil"></i>
                    </button>
                  </div>
              </div>
              <div class="box-body">
              {
                this.state.questionParams.map((param) => {
                  return (param.question_id === question.id)
                    ? <ParamWidget key={param.id} param={param} />
                    : null;
                })
              }
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}
