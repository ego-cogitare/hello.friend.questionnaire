import React from 'react';
import classNames from 'classnames';
import QuestionWidget from '../QuestionWidget.jsx';

export default class TypeContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      categoryQuestion: props.categoryQuestion,
      questionParams: props.questionParams,
    };
    // categoryQuestion
    // {
    //     "id": 71,
    //     "created_at": "2018-01-25 15:32:40",
    //     "updated_at": "2018-01-25 15:32:40",
    //     "category_id": 8,
    //     "question_id": 1,
    //     "order": 71,
    //     "question": {
    //         "id": 1,
    //         "created_at": "2018-01-25 15:32:22",
    //         "updated_at": "2018-01-25 15:32:22",
    //         "name": "Pick your Top 3 Personality",
    //         "type": 2,
    //         "parent_id": null,
    //         "custom_type": null,
    //         "questions": []
    //     }
    // },

    console.log('params', this.state.categoryQuestion);
  }

  render() {
    return (
      <div class="box-body">
      {
        this.state.categoryQuestion.question.questions.map((category_question) => {
          console.log('z', category_question);

          return (
            <QuestionWidget
              key={category_question.id}
              categoryQuestion={category_question}
              questionParams={[]}
            />
          );
        })
      }
      </div>
    );
  }
}
