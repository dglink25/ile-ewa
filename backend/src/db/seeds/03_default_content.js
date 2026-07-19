exports.seed = async function (knex) {
  // Page "Présentation" par défaut, pour que /presentation ne renvoie pas 404
  const presentation = await knex('pages').where({ slug: 'presentation' }).first();
  if (!presentation) {
    await knex('pages').insert({
      title: 'Présentation',
      slug: 'presentation',
      status: 'published',
      content_html: `
        <p>Bienvenue sur la page de présentation d'Ilé Ẹwà. Ce texte est un exemple :
        modifiez-le librement depuis le back office (Admin → Pages du site → Présentation).</p>
        <p>Vous pouvez y écrire votre histoire, votre mission, vos valeurs, et mettre en forme
        le texte comme dans un traitement de texte (gras, couleurs, tableaux...).</p>
      `,
    });
  }

  // Réglages par défaut de la page d'accueil (modifiables dans Admin → Paramètres du site)
  const defaultSlides = JSON.stringify([
    {
      id: 'slide-1',
      image_url: '',
      title: 'Ilé Ẹwà',
      subtitle: "La maison de la beauté et de l'harmonie — un cercle de membres, de savoirs et de rencontres.",
      quote: '',
      cta_text: 'Rejoindre le cercle',
      cta_link: '/inscription',
    },
  ]);

  const defaults = {
    home_slides: defaultSlides,
    home_intro_html: `
      <p>Ilé Ẹwà est un espace communautaire dédié à la rencontre, à la transmission de savoirs
      et à l'accompagnement de chacun·e dans son cheminement personnel.</p>
    `,
  };

  for (const [key, value] of Object.entries(defaults)) {
    const existing = await knex('settings').where({ key }).first();
    if (!existing) {
      await knex('settings').insert({ key, value });
    }
  }
};
