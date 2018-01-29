import React from 'react';
import classNames from 'classnames';

export default class TypeContainer extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      params: props.questionParams
    };
  }

  render() {
    return (
      <div>
        <div class="box-body">
          <span>Type container</span>
        </div>
      </div>
    );
  }
}
