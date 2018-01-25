import React from 'react';
import classNames from 'classnames';
import { Checkbox } from 'react-icheck';
import './staticFiles/css/styles.css';
import data from './mock';
import a from './data';
console.log(a)

export default class Questionnaire extends React.Component {

  constructor(props) {
    super(props);

    // Empty podcast
    this.emptyPodcast = { name: '', enabled: true, order: 999, isNew: true };

    // Empty category
    this.emptyCategory = { name: '', podcast_id: null, enabled: true, order: 999, isNew: true };

    this.state = Object.assign(data, {
      // Current selected podcast
      selectedPodcast: null,

      // Current selected category
      selectedCategory: null,

      // New podcast temporary store
      newPodcast: { ...this.emptyPodcast },

      // New category temporary store
      newCategory: { ...this.emptyCategory },
    });

    // Clone and save application state
    this.savedState = JSON.parse(JSON.stringify(this.state));
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

  onPodcastSelect(podcast) {
    // Mark current podcast as selected
    this.state.podcasts.map((p) => {
      Object.assign(p, { isSelected: podcast.id === p.id });
      return p;
    });

    // Mark all categories as unselected
    this.state.categories.map((c) => {
      Object.assign(c, { isSelected: false })
      return c;
    });

    this.setState({
      podcasts: this.state.podcasts,
      categories: this.state.categories,
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

  /*
   * Podcast name update
   */
  onPodcastSave(podcast, e) {
    e.preventDefault();
    Object.assign(podcast, { name: this.refs[`podcast-${podcast.id}`].value });
    this.setState({ podcasts: this.state.podcasts });
  }




  onCategorySelect(category) {
    // Mark current category as selected
    this.state.categories.map((c) => {
      Object.assign(c, { isSelected: category.id === c.id });
      return c;
    });

    // Mark all questions as unselected
    this.state.questions.map((q) => {
      Object.assign(q, { isSelected: false })
      return q;
    });

    this.setState({
      categories: this.state.categories,
      selectedCategory: category.id
    },
    () => this.initSortable(this.refs.questions));
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

  /*
   * Category name update
   */
  onCategorySave(category, e) {
    e.preventDefault();
    Object.assign(category, { name: this.refs[`category-${category.id}`].value });
    this.setState({ categories: this.state.categories });
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
                  this.state.categories.filter(({ podcast_id }) => podcast_id === this.state.selectedPodcast).map((category) => (
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
                  this.state.categories.filter(({ podcast_id }) => podcast_id === this.state.selectedPodcast).length === 0 &&
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
              <ol ref="questions" class="sortable">
                <h4 class="box-title">Category Questions</h4>
                {
                  this.state.categories_questions.map(({id, category_id, question_id}) => {
                    // Search question in questions list
                    const question = this.state.questions
                      .find(({id}) => id === question_id && this.state.selectedCategory === category_id);

                      return null;
                  })
                }
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
