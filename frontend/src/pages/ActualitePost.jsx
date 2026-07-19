import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client';
import ArticleDetail from '../components/ArticleDetail';

export default function ActualitePost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/articles/public/${slug}`)
      .then(({ data }) => setArticle(data.article))
      .catch(() => setError('Article introuvable.'));
  }, [slug]);

  if (error) return <div className="container" style={{ padding: 60 }}><p>{error}</p></div>;
  if (!article) return <div className="container" style={{ padding: 60, textAlign: 'center' }}><p>Chargement…</p></div>;

  return <ArticleDetail article={article} backLink="/actualites" backLabel="Retour aux actualités" />;
}
