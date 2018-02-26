module.exports = {
  podcasts: [
      {
          id: 1,
          name: 'Podcast #1',
          enabled: true
      },
      {
          id: 2,
          name: 'Podcast #2',
          enabled: true
      },
      {
          id: 3,
          name: 'Podcast #3',
          enabled: true
      },
  ],

  categories: [
      {
          id: 1,
          name: 'My Kids',
          podcast_id: 1,
          enabled: true
      },
      {
          id: 2,
          name: 'My Interests',
          podcast_id: 1,
          enabled: true
      },
      {
          id: 3,
          name: 'Empty category',
          podcast_id: 1,
          enabled: true
      },
  ],

  questions: [
      {
          id: 5,
          parent_id: null,
          name: 'MY KIDS',
          type: 'container',
          custom_type: 'container',
      },
      {
          id: 6,
          parent_id: 5,
          name: 'Number of children',
          type: 'input',
          custom_type: 'number',
      },
      {
          id: 7,
          parent_id: 6,
          name: 'Age category of children',
          type: 'select',
          custom_type: 'tags',
      },
      {
          id: 8,
          parent_id: 6,
          name: 'SPECIAL NEEDS',
          type: 'container',
          custom_type: 'container',
      },
      {
          id: 9,
          parent_id: 8,
          name: 'Do you children relate to any of these?',
          type: 'select',
          custom_type: 'tag',
      },

      {
          id: 10,
          parent_id: null,
          name: 'MY LIFE EVENTS',
          type: 'container',
          custom_type: 'container',
      },
      {
          id: 11,
          parent_id: 10,
          name: 'Which have you experienced recently?',
          type: 'select',
          custom_type: 'list',
      },
  ],

  categories_questions: [
    {
      id: 1,
      category_id: 1,
      question_id: 5,
      order: 1,
    },
    {
      id: 2,
      category_id: 2,
      question_id: 10,
      order: 1,
    },
  ],

  question_params: [
    {
      id: 1,
      category_id: 1,
      question_id: 7,
      name: '',
      value: '',
    }
  ]
};
