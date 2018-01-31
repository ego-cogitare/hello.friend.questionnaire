import React from 'react';
import TypeText from './questionTypes/TypeText.jsx';
import TypeNumber from './questionTypes/TypeNumber.jsx';
import TypeSelect from './questionTypes/TypeSelect.jsx';
import TypeContainer from './questionTypes/TypeContainer.jsx';
import TypeLocation from './questionTypes/TypeLocation.jsx';
import TypeChildren from './questionTypes/TypeChildren.jsx';

export default class QuestionWidget extends React.Component {

  constructor(props) {
    super(props);

    // Question type
    this.questionType = props.categoryQuestion.question.type;

    if (this.questionType === 3) {
      this.questionType = props.categoryQuestion.question.custom_type;
    }
  }

  getWidgetByType(type, categoryQuestion, questionParams)
  {
    switch (type) {
      case 0:
        return (
          <TypeText
            categoryQuestion={categoryQuestion}
            questionParams={questionParams}
          />
        );
      break;

      case 1:
        return (
          <TypeNumber
            categoryQuestion={categoryQuestion}
            questionParams={questionParams}
          />
        );
      break;

      case 2:
        return (
          <TypeSelect
            categoryQuestion={categoryQuestion}
            questionParams={questionParams}
          />
        );
      break;

      case "location":
        return (
          <TypeLocation
            categoryQuestion={categoryQuestion}
            questionParams={questionParams}
          />
        );
      break;

      case "children":
        return (
          <TypeChildren
            categoryQuestion={categoryQuestion}
            questionParams={questionParams}
          />
        );
      break;

      default:
        return <pre>Unknown question type. {JSON.stringify(this.props.questionParams)}</pre>;
      break;
    }
  }

  render() {
    return this.getWidgetByType(
      this.questionType,
      this.props.categoryQuestion,
      this.props.questionParams
    );
  }
}
