import React from 'react';
import classNames from 'classnames';
import { Checkbox } from 'react-icheck';
import './staticFiles/css/styles.css';
import QuestionWidget from './widgets/QuestionWidget.jsx';

export default class Questionnaire extends React.Component {

  constructor(props) {
    super(props);

    // Podcasts identities
    this.podcastIdentities = [];

    // Empty podcast
    this.emptyPodcast = { name: '', enabled: true, order: 999, isNew: true };

    // Empty category
    this.emptyCategory = { name: '', podcast_id: null, enabled: true, order: 999, isNew: true };

    this.state = {

      // Retreive once on page load
      podcasts: [
        {
          id: 2,
          name: 'Office workers'
        }
      ],

      categories: [],

      // Questions of the selected category
      category_questions: [],

      // Question params of the selected category
      question_params: [],

      // Current selected podcast
      selectedPodcast: null,

      // Current selected category
      selectedCategory: null,

      // Current selected category
      selectedQuestion: null,

      // New podcast temporary store
      newPodcast: { ...this.emptyPodcast },

      // New category temporary store
      newCategory: { ...this.emptyCategory },
    };
  }

  componentDidMount() {
    this.initSortable(this.refs.podcasts);
  }

  initSortable(ref) {
    $(ref).nestedSortable({
      forcePlaceholderSize: true,
      handle: 'div',
      helper:	'clone',
      items: 'li',
      opacity: .6,
      placeholder: 'placeholder',
      revert: 250,
      tolerance: 'pointer',
      toleranceElement: '> div',
      maxLevels: 1,
      isTree: true,
      expandOnHover: 700,
      startCollapsed: false,
      stop: (e) => {
        $(e.target).find('li').each((order, item) => {
          const itemId = $(item).data('id');
          const sortableName = $(item).data('sortable-name');
          Object.assign(this.state[sortableName].find(({id}) => id === itemId), { order });
        });
      }
    });
  }

  /*
   * Set selected flag (isSelected property) false
   */
  resetSelection(items, selectId = null) {
    items.forEach((item) => {
      Object.assign(item, { isSelected: false });
      selectId &&  item.id === selectId && Object.assign(item, { isSelected: true });
    });
  }

  /*
   * Get podcast identity
   */
  getPodcastIdentity(podcastId) {
    let identity = this.podcastIdentities.find(({id}) => podcastId);

    // If podcast found in identities storrage
    if (identity) {
      return identity;
    }

    // Retreive podcast from server
    let { status, podcast } = $.ajax({
      type: 'GET',
      url: '/data.json',
      async: false,
    }).responseJSON;

    if (status) {
      // Add podcast to podcast identities
      this.podcastIdentities.push(podcast);
      return podcast;
    }
  }

  onPodcastSelect(podcast) {
    // Mark current podcast as selected
    this.resetSelection(this.state.podcasts, podcast.id);

    // Get all podcast categories
    const categories = this.getPodcastIdentity(podcast.id).categories;

    this.setState({
      podcasts: this.state.podcasts,
      categories,
      selectedPodcast: podcast.id,
      selectedCategory: null
    },
    () => this.initSortable(this.refs.categories));
  }

  /**
   * Slide toggle on podcast edit
   */
  onPodcastEdit(podcast, e) {
    e.preventDefault();
    e.stopPropagation();
    Object.assign(podcast, { isExpanded: !podcast.isExpanded });
    this.setState({ podcasts: this.state.podcasts });
  }

  /**
   * On podcast add
   */
  onPodcastAdd() {
    // Can not add empty podcasts
    if (this.state.newPodcast.name === '') {
      return false;
    }

    // Clone temporary podcast
    const podcast = { ...this.state.newPodcast, id: Date.now() };

    // Add podcast to podcasts list
    this.state.podcasts.push(podcast);

    // Update view
    this.setState({
      podcasts: this.state.podcasts,
      newPodcast: { ...this.emptyPodcast }
    },);
  }

  /**
   * On podcast remove
   */
  onPodcastRemove(podcast, e) {
    e.preventDefault();
    e.stopPropagation();

    // If podcast not stored yet
    if (podcast.isNew) {
      this.doRemovePodcast(podcast);
    }
    // Podcast removing availability should be checked before podcast deletion
    else {
      alert('Podcast removing availability should be checked before podcast deletion.');
    }
  }

  /**
   * Do podcast remove action
   */
  doRemovePodcast(podcast) {
    const podcasts = this.state.podcasts.filter(({id}) => id !== podcast.id);
    this.setState({ podcasts });
  }

  /**
   * Podcast name update
   */
  onPodcastSave(podcast, e) {
    e.preventDefault();
    Object.assign(podcast, { name: this.refs[`podcast-${podcast.id}`].value });
    this.setState({ podcasts: this.state.podcasts });
  }



  /**
   * Category select
   */
  onCategorySelect(category) {
    // Mark current category as selected
    this.resetSelection(this.state.categories, category.id);

    // Get all category questions
    const category_questions = category.category_questions;

    // Get all category question params
    const question_params = category.question_params;

    this.setState({
      // To update category selection marker
      categories: this.state.categories,

      // List of category questions
      category_questions,

      // List of category question params
      question_params,

      // Save link to current selected category
      selectedCategory: category
    },
    () => this.initSortable(this.refs.category_questions));
  }

  /**
   * Slide toggle on category edit
   */
  onCategoryEdit(category, e) {
    e.preventDefault();
    e.stopPropagation();
    Object.assign(category, { isExpanded: !category.isExpanded });
    this.setState({ categories: this.state.categories });
  }

  /**
   * On category add
   */
  onCategoryAdd() {
    // Can not add empty podcasts or add to unexisting category
    if (!this.state.newCategory.name || !this.state.selectedPodcast) {
      return false;
    }

    // Clone temporary category
    const category = { ...this.state.newCategory, podcast_id: this.state.selectedPodcast, id: Date.now() };

    // Add category to categories list
    this.state.categories.push(category);

    // Update view
    this.setState({
      categories: this.state.categories,
      newCategory: { ...this.emptyCategory }
    });
  }

  /**
   * On category remove
   */
  onCategoryRemove(category, e) {
    e.preventDefault();
    e.stopPropagation();

    // If category not stored yet
    if (category.isNew) {
      this.doRemoveCategory(category);
    }
    // Category removing availability should be checked before category deletion
    else {
      alert('Category removing availability should be checked before category deletion.');
    }
  }

  /**
   * Do category remove action
   */
  doRemoveCategory(category) {
    const categories = this.state.categories.filter(({id}) => id !== category.id);
    this.setState({ categories });
  }

  /**
   * Category name update
   */
  onCategorySave(category, e) {
    e.preventDefault();
    Object.assign(category, { name: this.refs[`category-${category.id}`].value });
    this.setState({ categories: this.state.categories });
  }


  /**
   * Expand/collapse question edit form
   */
  onQuestionEdit(category_question, e) {
    e.preventDefault();
    e.stopPropagation();
    Object.assign(category_question, { isExpanded: !category_question.isExpanded });
    this.setState({ category_questions: this.state.category_questions });
  }

  onQuestionRemove(category_question, e) {
    console.log(category_question);
  }

  /**
   * Get list of question params for category question
   */
  getQuestionParams(category_question) {
    return this.state.question_params.filter(
      ({question_id, category_id}) => question_id === category_question.question_id && category_id === category_question.category_id
    );
  }

  onQuestionWidgetSave(widgetState) {
    console.log('onQuestionWidgetSave', widgetState);
  }

  render() {

    return (
      <div class="box box-primary">
        <div class="box-body">

          <div class="row">
            <div class="col-md-4">
              <h4 class="box-title">Podcasts</h4>
              <ol ref="podcasts" class="sortable">
                {
                  this.state.podcasts.map((podcast) => (
                    <li key={podcast.id} data-id={podcast.id} data-sortable-name="podcasts" class={classNames({ 'selected': podcast.isSelected })}>
                      <div class={classNames('box box-solid box-primary podcast', {'collapsed-box': !podcast.isExpanded })}>
                        <div class="box-header with-border" onClick={this.onPodcastSelect.bind(this, podcast)}>
                          <h3 class="box-title">{podcast.name}</h3>
                          <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" onClick={this.onPodcastEdit.bind(this, podcast)}><i class="fa fa-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-box-tool" onClick={this.onPodcastRemove.bind(this, podcast)}><i class="fa fa-times"></i>
                            </button>
                          </div>
                        </div>
                        <div class="box-body">
                          <label>Podcast title</label>
                          <div class="form-group">
                            <input
                              type="text"
                              ref={`podcast-${podcast.id}`}
                              placeholder="Type Podcast Name..."
                              class="form-control"
                              defaultValue={podcast.name}
                              onKeyUp={(e) => e.which === 13 && this.onPodcastSave(podcast, e)}
                            />
                          </div>
                          <label>Enabled</label>
                          <div class="form-group no-margin">
                            <Checkbox
                              checkboxClass="icheckbox_square-blue"
                              increaseArea="20%"
                              checked={podcast.enabled}
                              onChange={(e) => {
                                Object.assign(podcast, { enabled: !e.target.checked });
                                this.setState({ podcasts: this.state.podcasts });
                              }}
                            />
                          </div>
                        </div>
                        <div class="box-footer">
                          <button type="submit" class="btn btn-primary btn-flat" onClick={this.onPodcastSave.bind(this, podcast)}>Save</button>
                        </div>
                      </div>
                    </li>
                  ))
                }
                { this.state.podcasts.length === 0 && <p>No podcasts available.</p> }
              </ol>

              {/* New podcast add form */}
              <div class="box box-default box-solid">
                <div class="box-header with-border">
                  <h3 class="box-title">Add new podcast</h3>
                </div>
                <div class="box-body">
                  <label>Podcast title</label>
                  <div class="form-group">
                    <div class="form-group">
                      <input
                        type="text"
                        placeholder="Type Podcast Name..."
                        class="form-control"
                        value={this.state.newPodcast.name}
                        onChange={(e) => {
                          Object.assign(this.state.newPodcast, { name: e.target.value });
                          this.setState({ newPodcast: this.state.newPodcast });
                        }}
                        onKeyUp={(e) => e.which === 13 && this.onPodcastAdd()}
                      />
                    </div>
                  </div>
                  <label>Enabled</label>
                  <div class="form-group no-margin">
                    <Checkbox
                      checkboxClass="icheckbox_square-blue"
                      increaseArea="20%"
                      checked={this.state.newPodcast.enabled}
                      onChange={(e) => {
                        Object.assign(this.state.newPodcast, { enabled: !e.target.checked });
                        this.setState({ newPodcast: this.state.newPodcast });
                      }}
                    />
                  </div>
                </div>
                <div class="box-footer">
                  <button type="submit" class="btn btn-primary btn-flat" onClick={this.onPodcastAdd.bind(this)}>Add</button>
                </div>
              </div>
            </div>

            <div class="col-md-4">
              <h4 class="box-title">Podcast Categories</h4>
              <ol ref="categories" class="sortable">
                {
                  this.state.categories.map((category) => (
                    <li key={category.id} data-id={category.id} data-sortable-name="categories" class={classNames({ 'selected': category.isSelected })}>
                      <div class={classNames('box box-solid box-primary podcast', {'collapsed-box': !category.isExpanded })}>
                        <div class="box-header with-border" onClick={this.onCategorySelect.bind(this, category)}>
                          <h3 class="box-title">{category.name}</h3>
                          <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" onClick={this.onCategoryEdit.bind(this, category)}><i class="fa fa-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-box-tool" onClick={this.onCategoryRemove.bind(this, category)}><i class="fa fa-times"></i>
                            </button>
                          </div>
                        </div>
                        <div class="box-body">
                          <label>Category title</label>
                          <div class="form-group">
                            <input
                              type="text"
                              ref={`category-${category.id}`}
                              placeholder="Type Category Name..."
                              class="form-control"
                              defaultValue={category.name}
                            />
                          </div>
                          <label>Enabled</label>
                          <div class="form-group no-margin">
                            <Checkbox
                              checkboxClass="icheckbox_square-blue"
                              increaseArea="20%"
                              checked={category.enabled}
                              onChange={(e) => {
                                Object.assign(category, { enabled: !e.target.checked });
                                this.setState({ categories: this.state.categories });
                              }}
                            />
                          </div>
                        </div>
                        <div class="box-footer">
                          <button type="submit" class="btn btn-primary btn-flat" onClick={this.onCategorySave.bind(this, category)}>Save</button>
                        </div>
                      </div>
                    </li>
                  ))
                }
                {
                  this.state.categories.length === 0 &&
                  <p>No categories available.</p>
                }
              </ol>
              {/* New category add form */
                this.state.selectedPodcast &&
                <div class="box box-default box-solid">
                  <div class="box-header with-border">
                    <h3 class="box-title">Add new category</h3>
                  </div>
                  <div class="box-body">
                    <label>Category title</label>
                    <div class="form-group">
                      <div class="form-group">
                        <input
                          type="text"
                          placeholder="Type Category Name..."
                          class="form-control"
                          value={this.state.newCategory.name}
                          onChange={(e) => {
                            Object.assign(this.state.newCategory, { name: e.target.value });
                            this.setState({ newCategory: this.state.newCategory });
                          }}
                          onKeyUp={(e) => e.which === 13 && this.onCategoryAdd()}
                          />
                      </div>
                    </div>
                    <label>Enabled</label>
                    <div class="form-group no-margin">
                      <Checkbox
                        checkboxClass="icheckbox_square-blue"
                        increaseArea="20%"
                        checked={this.state.newCategory.enabled}
                        onChange={(e) => {
                          Object.assign(this.state.newCategory, { enabled: !e.target.checked });
                          this.setState({ newCategory: this.state.newCategory });
                        }}
                        />
                    </div>
                  </div>
                  <div class="box-footer">
                    <button type="submit" class="btn btn-primary btn-flat" onClick={this.onCategoryAdd.bind(this)}>Add</button>
                  </div>
                </div>
              }
            </div>

            <div class="col-md-4">
              <h4 class="box-title">Question Parametres</h4>
              <ol ref="category_questions" class="sortable">
                {
                  this.state.category_questions.map((category_question) => (
                    <li key={category_question.id} data-id={category_question.id} data-sortable-name="category_questions">
                      <div class={classNames('box box-solid box-primary podcast', {'collapsed-box': !category_question.isExpanded })}>
                        <div class="box-header with-border">
                          <h3 class="box-title">{category_question.question.name}</h3>
                          <div class="box-tools pull-right">
                            <button type="button" class="btn btn-box-tool" onClick={this.onQuestionEdit.bind(this, category_question)}><i class="fa fa-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-box-tool" onClick={this.onQuestionRemove.bind(this, category_question)}><i class="fa fa-times"></i>
                            </button>
                          </div>
                        </div>
                        <QuestionWidget
                          categoryQuestion={category_question}
                          questionParams={this.getQuestionParams(category_question)}
                          onSave={this.onQuestionWidgetSave.bind(this)}
                        />
                      </div>
                    </li>
                  ))
                }
                { this.state.category_questions.length === 0 && <p>No questions available.</p> }
              </ol>
            </div>
          </div>

        </div>
        <div class="box-footer">
          <button type="submit" class="btn btn-primary pull-right">Publish changes</button>
          <button type="submit" class="btn btn-default pull-right">Cancel</button>
        </div>
      </div>
    );
  }
}
