import React from 'react';
import classNames from 'classnames';
import { Checkbox } from 'react-icheck';
import './staticFiles/css/styles.css';
import QuestionWidget from './widgets/QuestionWidget.jsx';
import questionParams from './questionParams';
import questionTypeParamsSet from './questionTypeParamsSet';
import axios, { post } from 'axios';
import { uniqueId } from './Utils';

export default class Questionnaire extends React.Component {

  constructor(props) {
    super(props);

    // Podcasts identities
    this.podcastIdentities =
    window.podcastIdentities = [];

    // Empty podcast
    this.emptyPodcast = {
      name: '',
      categories: [],
      enabled: true,
      order: 999,
      isNew: true
    };

    // Empty category
    this.emptyCategory = {
      name: '',
      icon: '',
      type: window.questionnaire.categoryType,
      podcast_id: null,
      category_questions: [],
      question_params: [],
      enabled: true,
      order: 999,
      isNew: true
    };

    // Empty category
    this.emptyQuestion = {
      name: '',
      parent_id: null,
      type: '0',
      custom_type: null,
      questions: [],
      isNew: true
    };

    this.state = {

      // Retreive once on page load
      podcasts: [],

      categories: [],

      // Existing questions library
      questions: [],

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

      // New question temporary store
      newQuestion: { ...this.emptyQuestion },

      // Podcast saving in progress
      dataSaving: false,
    };
  }

  fetchPodcastsList() {
    // Fetch list of podcasts
    $.ajax({
      type: 'GET',
      format: 'json',
      url: window.questionnaire.podcastsFetch || '/podcasts.json',
      success: (data) => this.setState({ podcasts: data }, () => this.initSortable(this.refs.podcasts)),
      error: (e) => console.error(e)
    });
  }

  componentDidMount() {
    this.fetchPodcastsList();

    // Fetch questions list
    $.ajax({
      type: 'GET',
      format: 'json',
      url: window.questionnaire.questionsFetch || '/questions.json',
      success: (questions) => this.setState({ questions }),
      error: (e) => console.error(e)
    });
  }

  initSortable(ref) {
    // $(ref).nestedSortable({
    //   forcePlaceholderSize: true,
    //   handle: 'div',
    //   helper:	'clone',
    //   items: 'li',
    //   opacity: .6,
    //   placeholder: 'placeholder',
    //   revert: 250,
    //   tolerance: 'pointer',
    //   toleranceElement: '> div',
    //   maxLevels: 1,
    //   isTree: true,
    //   expandOnHover: 700,
    //   startCollapsed: false,
    //   stop: (e) => {
    //     $(e.target).find('li').each((order, item) => {
    //       const itemId = $(item).data('id');
    //       const sortableName = $(item).data('sortable-name');
    //       Object.assign(this.state[sortableName].find(({id}) => id === itemId), { order });
    //     });
    //   }
    // });
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
  getPodcastIdentity(podcast) {
    console.info(`Get podcast identity: ${podcast.id}`);
    let identity = this.podcastIdentities.find(({id}) => id === podcast.id);

    // If podcast found in identities storage
    if (identity) {
      console.info(`Podcast found in identities list:`, identity);
      return identity;
    }

    // If podcast is new - add to podcast identities
    if (podcast.isNew) {
      console.info(`Podcast marked as new. Add podcast to podcast identities array.`, podcast);
      this.podcastIdentities.push(podcast);
      return podcast;
    }

    // Build podcast fetch url
    let fetchUrl = (window.questionnaire.podcastFetch || '').replace('{id}', podcast.id) || '/podcast.json';
    console.info(`Podcast fetched from url: ${fetchUrl}`);

    // Retreive podcast from server
    let { status, podcast: podcastIdentity } = $.ajax({
      type: 'GET',
      url: fetchUrl,
      async: false,
    }).responseJSON;

    if (status) {
      // Add podcast to podcast identities
      this.podcastIdentities.push(podcastIdentity);
      return podcastIdentity;
    }
  }

  onPodcastSelect(podcast) {
    // Mark current podcast as selected
    this.resetSelection(this.state.podcasts, podcast.id);

    // Get all podcast categories
    const categories = this.getPodcastIdentity(podcast).categories;

    this.setState({
      podcasts: this.state.podcasts,
      categories,
      category_questions: [],
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
   * Podcast name update
   */
  onPodcastNameUpdate(podcast, name) {
    const identity = this.getPodcastIdentity(podcast);
    Object.assign(identity, { name });
    Object.assign(podcast, { name });
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
    const podcast = JSON.parse(JSON.stringify({ ...this.state.newPodcast, id: uniqueId() }));

    // Add podcast to podcasts list
    this.state.podcasts.push(podcast);

    // Update view
    this.setState({
      podcasts: this.state.podcasts,
      newPodcast: { ...this.emptyPodcast }
    });
  }

  /**
   * On podcast remove
   */
  onPodcastRemove(podcast, e) {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm(`Are you sure want to delete this podcast?`)) return false;

    // If podcast not stored yet
    if (podcast.isNew) {
      this.doRemovePodcast(podcast);
    }
    // Podcast removing availability should be checked before podcast deletion
    else {
      $.ajax({
        url: window.questionnaire.podcastSync.replace('{id}', podcast.id),
        type: 'delete',
        success: (r) => {
          this.doRemovePodcast(podcast);
        },
        error: (e) => {
          console.error(e);
          alert('Podcast can not be deleted.');
        }
      });
    }
  }

  /**
   * Do podcast remove action
   */
  doRemovePodcast(podcast) {
    console.log('Podcast to remove:', podcast);
    // If current selected podcast deleted
    (this.state.selectedPodcast === podcast.id) && this.setState({ categories: [], questions: [] });

    const podcasts = this.state.podcasts.filter(({id}) => id !== podcast.id);
    this.setState({ podcasts });
  }

  /**
   * Podcast name update
   */
   onPodcastSave(e) {
     e.preventDefault();

     if (this.state.dataSaving) {
       console.log(`Podcast already in saving progress`);
       return false;
     }

     // If not podcast is selected
     if (!this.state.selectedPodcast) return false;

     // Get current selected podcast
     const podcast = this.getPodcastIdentity({ id: this.state.selectedPodcast });

     // Podcast save url
     const url = window.questionnaire.podcastSync.replace('{id}', this.state.selectedPodcast);

     // If no podcast found in identities or podcast sync url not defined
     if (!podcast || !url) return false;

     this.setState({ dataSaving: true });

     $.ajax({
       url,
       data: { podcast: JSON.stringify(podcast) },
       type: 'put',
       success: (r) => {
         this.setState({
           dataSaving: false,
           selectedPodcast: null,
           selectedCategory: null,
           selectedQuestion: null,
           categories: [],
           category_questions: [],
           question_params: []
         },
         () => {
           this.podcastIdentities = [];
           this.fetchPodcastsList();
         }
        );
       },
       error: (e) => console.error(e)
     });
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
    const category = JSON.parse(JSON.stringify(
      { ...this.state.newCategory,
        podcast_id: this.state.selectedPodcast, id: uniqueId() }));

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

    if (!confirm(`Are you sure want to delete this category?`)) return false;

    // If category not stored yet
    if (category.isNew) {
      this.doRemoveCategory(category);
    }
    // Category removing availability should be checked before category deletion
    else {
      $.ajax({
        url: window.questionnaire.categorySync.replace('{id}', category.id),
        type: 'delete',
        success: (r) => {
          this.doRemoveCategory(category);
        },
        error: (e) => {
          console.error(e);
          alert('Category can not be deleted.');
        }
      });
    }
  }

  /**
   * Do category remove action
   */
  doRemoveCategory(category) {
    console.log('Category to remove:', category);

    // If current selected category deleted
    (this.state.selectedCategory.id === category.id) && this.setState({ category_questions: [] });

    const categories = this.state.categories.filter(({id}) => id !== category.id);
    this.setState({ categories });
  }

  /**
   * Category name update
   */
  onCategoryNameUpdate(category, name) {
    // Dissallow category empty names
    if (!name) return false;

    Object.assign(category, { name });
    this.setState({ categories: this.state.categories });
  }


  /**
   * Get list of question params for category question
   */
  getQuestionParams(category_question) {
    // Container question params need to obtain
    if (category_question.question.type === 3) {
      let params = [];

      // Obtain all question params for all child questions
      category_question.question.questions.forEach((question) => {
        let questionParams = this.state.question_params.filter(
          ({question_id, category_id}) => (question_id === question.id && category_id === category_question.category_id)
        );

        // If no parameters found
        if (questionParams.length === 0) {
          console.error(`No parameters found for: category_id - ${category_question.category_id}, question_id - ${question.id}. Question:`, question);
          return;
        }
        params = params.concat(questionParams);
      });
      return params;
    }

    return this.state.question_params.filter(
      ({question_id, category_id}) => (question_id === category_question.question_id && category_id === category_question.category_id)
    );
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
    if (!category_question) return false;

    let questionIds = (category_question.question.type == 3)
      ? category_question.question.questions.map(({id}) => id)
      : [category_question.question_id];

    // Question removing confirmation
    if (!confirm(`Are you sure want to delete this question?`)) return false;

    // Remove question from category's questions
    this.state.category_questions
      = this.state.category_questions
        .filter(
          ({category_id, question_id}) =>
            !(question_id === category_question.question_id &&
              category_id === category_question.category_id)
        );

    // Remove question settings
    this.state.question_params
      = this.state.question_params
        .filter(
          ({category_id, question_id}) =>
            !(questionIds.indexOf(question_id) !== -1 &&
              category_id === category_question.category_id)
        );

    // Update podcast identity
    const category = this.getPodcastIdentity({ id: this.state.selectedPodcast })
      .categories.find(({id}) => id === this.state.selectedCategory.id);

    if (!category) {
      console.error(`Quistion category not found. Question:`, category_question);
      return false;
    }

    // Update podcast identity
    Object.assign(category, {
      category_questions: this.state.category_questions,
      question_params: this.state.question_params,
    });

    this.setState({
      category_questions: this.state.category_questions,
      question_params: this.state.question_params
    });
  }

  isQuestionCustom(type) {
    return ['0', '1', '2', 0, 1, 2].indexOf(type) === -1;
  }

  onCategoryExistQuestionAdd() {
    const $modal = $(this.refs['questions-modal']);

    $modal.show(0, function() {
      $(this).addClass('in');
    });
  }

  closeQuestionsModal() {
    const $modal = $(this.refs['questions-modal']);

    $modal.removeClass('in');
    setTimeout(() => $modal.css({ display: 'none' }), 500);
  }

  onQuestionSelect(question, e) {
    e.preventDefault();
    this.state.questions.forEach(
      (question) => Object.assign(question, { isSelected: false })
    );
    Object.assign(question, { isSelected: true });
    this.setState({ questions: this.state.questions });
  }

  onQuestionAdd() {
    const question = this.state.questions.find(({isSelected}) => isSelected);

    if (!question) {
      return false;
    }

    // Check if the question already exists in the category
    const questionExists = this.state.category_questions.find(({ category_id, question_id }) => {
      return category_id === this.state.selectedCategory.id && question_id === question.id;
    });

    if (questionExists) {
      alert(`Question already exists in the category.`);
      return false;
    }

    // Reset question selection in the modal popup
    this.state.questions.forEach(
      (question) => Object.assign(question, { isSelected: false })
    );
    this.setState({ questions: this.state.questions });

    // Add question to category
    let categoryQuestion = {
      id: question.id,
      isNew: false,
      category_id: this.state.selectedCategory.id,
      question_id: question.id,
      order: 999,
      question: { ...question }
    };

    // Add question to category
    this.state.category_questions.push(categoryQuestion);

    // Create question default params set
    let questionParams = questionTypeParamsSet[question.type]
      .map(({ name, value }, key) => {
        return {
          id: question.id + key + 1,
          question_id: question.id,
          category_id: this.state.selectedCategory.id,
          name,
          value,
        };
      });

    // Add question settings
    questionParams.forEach((param) => {
      this.state.question_params.push(param);
    });

    this.setState(
      { question_params: this.state.question_params,
        category_questions: this.state.category_questions },
      () => this.closeQuestionsModal()
    );
  }

  /**
   * On question add
   */
  onCategoryNewQuestionAdd() {
    // Can not add empty podcasts or add to unexisting category
    if (!(this.state.newQuestion.name || this.isQuestionCustom(this.state.newQuestion.type)) || !this.state.selectedCategory) {
      return false;
    }

    // Add basic question
    if (!this.isQuestionCustom(this.state.newQuestion.type))
    {
      // Generate question temporary Id
      const questionId = uniqueId();

      let categoryQuestion = {
        id: questionId - 1,
        isNew: true,
        category_id: this.state.selectedCategory.id,
        question_id: questionId,
        order: 999,
        question:  Object.assign(
          {},
          { ...this.state.newQuestion },
          { id: questionId, type: Number(this.state.newQuestion.type) }
        )
      };

      // Add question to category
      this.state.category_questions.push(categoryQuestion);

      // Create question default params set
      let questionParams = questionTypeParamsSet[this.state.newQuestion.type]
        .map(({ name, value }, key) => {
          return {
            id: questionId + key + 1,
            question_id: questionId,
            category_id: this.state.selectedCategory.id,
            name,
            value,
          };
        });

      // Add question settings
      questionParams.forEach((param) => {
        this.state.question_params.push(param);
      });

      this.setState(
        { question_params: this.state.question_params,
          category_questions: this.state.category_questions,
          newQuestion: Object.assign(
            { ...this.emptyQuestion },
            { type: Number(this.state.newQuestion.type) }
          ) }
      );
    }

    if (['location', 'children'].indexOf(this.state.newQuestion.type) !== -1)
    {
      // Generate question temporary Id
      const questionId = uniqueId();
      const { [this.state.newQuestion.type]: customType } = window.questionnaire.customTypes;

      // Check if the question already exists in the category
      if (this.state.category_questions.find(
          ({ category_id, question_id }) => category_id === this.state.selectedCategory.id && question_id === customType.id
      )) {
        alert('This question already exists in the category.');
        return false;
      }

      let categoryQuestion = {
        id: questionId - 1,
        isNew: true,
        category_id: this.state.selectedCategory.id,
        question_id: customType.id,
        order: 999,
        question:  Object.assign(
          {},
          { ...this.state.newQuestion },
          { id: customType.id,
            type: 3,
            name: customType.name,
            parent_id: null,
            custom_type: this.state.newQuestion.type,
            questions: customType.questions.map(({ id, name, type }) => ({
              id,
              name,
              type,
              parent_id: customType.id,
              custom_type: null,
              questions: []
            }))
          }
        )
      };

      // Add question to category
      this.state.category_questions.push(categoryQuestion);

      // Create question default params set
      let questionParams = [];
      customType.questions.forEach(({ id, name, type }) => {
        questionParams = questionParams.concat(
          questionTypeParamsSet[type].map(({ name, value }, key) => ({
            id: questionId + key,
            question_id: id,
            category_id: this.state.selectedCategory.id,
            name,
            value,
          }))
        );
      });

      // Add question settings
      questionParams.forEach((param) => {
        this.state.question_params.push(param);
      });

      this.setState(
        { question_params: this.state.question_params,
          category_questions: this.state.category_questions,
          newQuestion: Object.assign(
            { ...this.emptyQuestion },
            { type: Number(this.state.newQuestion.type) }
          ) }
      );
    }
  }

  onSelectCategoryIconFormSubmit(category, e) {
    e.preventDefault();

    post(
      window.questionnaire.fileUpload || '/file/upload',
      new FormData(e.target),
      {headers:{'content-type':'multipart/form-data'}}
    )
    .then(({data}) => {
      // Update category icon
      Object.assign(category, { icon: data.path });

      // Rerender icons
      this.setState({ categories: this.state.categories });
    });
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
                              placeholder="Type Podcast Name..."
                              class="form-control"
                              defaultValue={podcast.name}
                              onKeyUp={(e) => e.which === 13 && this.onPodcastNameUpdate(podcast, e.target.value)}
                            />
                          </div>
                          <label>Enabled</label>
                          <div class="form-group no-margin">
                            <Checkbox
                              checkboxClass="icheckbox_square-blue"
                              increaseArea="20%"
                              checked={Boolean(podcast.enabled)}
                              onChange={(e) => {
                                Object.assign(podcast, { enabled: !e.target.checked });
                                this.setState({ podcasts: this.state.podcasts });
                              }}
                            />
                          </div>
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
                          <label>Category icon</label>
                          <div class="form-group">
                            <form style={{display:'none'}} onSubmit={this.onSelectCategoryIconFormSubmit.bind(this, category)}>
                              <input type="hidden" name="categoryId" value={category.id} />
                              <input type="hidden" name="currentIcon" value={category.icon || ''} />
                              <input
                                type="file"
                                name="icon"
                                ref={`icon-select-file-${category.id}`}
                                onChange={(e) => {
                                  // Trigger submit button click to send form
                                  $(this.refs[`icon-select-submit-btn-${category.id}`]).trigger('click');
                                }}
                              />
                              <button type="submit" ref={`icon-select-submit-btn-${category.id}`}>Upload</button>
                            </form>
                            <div class={classNames('category-icon', {'fa fa-plus': !category.icon})} onClick={() => $(this.refs[`icon-select-file-${category.id}`]).trigger('click')}>
                              { category.icon && <img width="56" height="56" style={{display:'block'}} src={`${window.questionnaire.storagePath || '/'}${category.icon}`} alt={category.icon} /> }
                            </div>
                          </div>
                          <label>Category title</label>
                          <div class="form-group">
                            <input
                              type="text"
                              placeholder="Type Category Name..."
                              class="form-control"
                              defaultValue={category.name}
                              onKeyUp={(e) => e.which === 13 && this.onCategoryNameUpdate(category, e.target.value)}
                            />
                          </div>
                          <label>Enabled</label>
                          <div class="form-group no-margin">
                            <Checkbox
                              checkboxClass="icheckbox_square-blue"
                              increaseArea="20%"
                              checked={Boolean(category.enabled)}
                              onChange={(e) => {
                                Object.assign(category, { enabled: !e.target.checked });
                                this.setState({ categories: this.state.categories });
                              }}
                            />
                          </div>
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
              <h4 class="box-title">Category Questions</h4>
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
                        />
                      </div>
                    </li>
                  ))
                }
                { this.state.category_questions.length === 0 && <p>No questions available.</p> }
              </ol>
              {/* New category add form */
                this.state.selectedCategory &&
                <div class="box box-default box-solid">
                  <div class="box-header with-border">
                    <h3 class="box-title">Add new question</h3>
                  </div>
                  <div class="box-body">
                    {
                      !this.isQuestionCustom(this.state.newQuestion.type) &&
                      <div>
                        <label>Question title</label>
                        <div class="form-group">
                          <div class="form-group">
                            <input
                              type="text"
                              placeholder="Type Question..."
                              class="form-control"
                              value={this.state.newQuestion.name}
                              onChange={(e) => {
                                Object.assign(this.state.newQuestion, { name: e.target.value });
                                this.setState({ newQuestion: this.state.newQuestion });
                              }}
                              onKeyUp={(e) => e.which === 13 && this.onCategoryNewQuestionAdd()}
                            />
                          </div>
                        </div>
                      </div>
                    }
                    <label>Question type</label>
                    <div class="form-group no-margin">
                      <select class="form-control" ref="questionType" onChange={(e) => {
                        Object.assign(this.state.newQuestion, { type: e.target.value });
                        this.setState({ newQuestion: this.state.newQuestion });
                      }}>
                        <option value="0">Custom Text</option>
                        <option value="1">Numeric</option>
                        <option value="2">Selection</option>
                        <option value="location">Location</option>
                        <option value="children">Children</option>
                      </select>
                    </div>
                  </div>
                  <div class="box-footer">
                    <button type="submit" class="btn btn-primary btn-flat" onClick={this.onCategoryNewQuestionAdd.bind(this)}>Add New</button>
                    <button type="submit" class="btn btn-info btn-flat pull-right" onClick={this.onCategoryExistQuestionAdd.bind(this)}>Add Existing</button>
                  </div>
                </div>
              }
            </div>
          </div>

        </div>
        <div class="box-footer">
          <button
            type="submit"
            class={classNames('btn btn-primary pull-right', { 'disabled': this.state.dataSaving })}
            onClick={this.onPodcastSave.bind(this)}
          >{this.state.dataSaving ? 'Saving...' : 'Save changes'}</button>
        </div>

        <div class="modal fade" ref="questions-modal" style={{ display:'none' }}>
          <div class="modal-dialog" style={{ width:1000 }}>
            <div class="modal-content">
              <div class="modal-header">
                <button type="button" class="close" onClick={this.closeQuestionsModal.bind(this)}>
                  <span>×</span>
                </button>
                <h4 class="modal-title">Select question to add</h4>
              </div>
              <div class="modal-body questions-library">
                {
                  this.state.questions.map((question) => (
                    <p class={classNames('question', { 'selected': question.isSelected })} key={question.id} onClick={this.onQuestionSelect.bind(this, question)}>{question.name}</p>
                  ))
                }
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-default pull-left" data-dismiss="modal" onClick={this.closeQuestionsModal.bind(this)}>Close</button>
                <button type="button" class="btn btn-primary" onClick={this.onQuestionAdd.bind(this)}>Add question</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
