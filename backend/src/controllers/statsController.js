const knex = require('../db/knex');

async function getStats(req, res) {
  const [pages] = await knex('pages').count({ count: '*' });
  const [articlesPublished] = await knex('articles').where({ status: 'published' }).count({ count: '*' });
  const [articlesDraft] = await knex('articles').where({ status: 'draft' }).count({ count: '*' });
  const [membersPublished] = await knex('profiles').where({ is_published: true }).count({ count: '*' });
  const [membersTotal] = await knex('profiles').count({ count: '*' });
  const [subscribers] = await knex('newsletter_subscribers').where({ status: 'subscribed' }).count({ count: '*' });
  const [media] = await knex('media').count({ count: '*' });

  res.json({
    pages: Number(pages.count),
    articlesPublished: Number(articlesPublished.count),
    articlesDraft: Number(articlesDraft.count),
    membersPublished: Number(membersPublished.count),
    membersTotal: Number(membersTotal.count),
    subscribers: Number(subscribers.count),
    media: Number(media.count),
  });
}

module.exports = { getStats };
