import React from 'react';
import TypeText from './questionTypes/TypeText.jsx';
import TypeNumber from './questionTypes/TypeNumber.jsx';
import TypeSelect from './questionTypes/TypeSelect.jsx';
import TypeContainer from './questionTypes/TypeContainer.jsx';

export default class QuestionWidget extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    switch (this.props.categoryQuestion.question.type) {
      case 0:
        return (
          <TypeText
            categoryQuestion={this.props.categoryQuestion}
            questionParams={this.props.questionParams}
            onSave={this.props.onSave}
          />
        );
      break;

      case 1:
        return (
          <TypeNumber
            categoryQuestion={this.props.categoryQuestion}
            questionParams={this.props.questionParams}
            onSave={this.props.onSave}
          />
        );
      break;

      case 2:
        return (
          <TypeSelect
            categoryQuestion={this.props.categoryQuestion}
            questionParams={this.props.questionParams}
            onSave={this.props.onSave}
          />
        );
      break;

      case 3:
        return <TypeContainer questionParams={this.props.questionParams} />;
      break;

      default:
        return <pre>Unknown question type. {JSON.stringify(this.props.questionParams)}</pre>;
      break;
    }
  }
}
