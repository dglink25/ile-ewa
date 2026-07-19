exports.seed = async function (knex) {
  // Page "Présentation" par défaut, pour que /presentation ne renvoie pas 404
  const presentation = await knex('pages').where({ slug: 'presentation' }).first();
  if (!presentation) {
    const exampleSections = JSON.stringify([
      {
        id: 'section-1',
        title: 'Notre mission',
        anchor: 'notre-mission',
        image_url: '',
        content_html: '<p>Décrivez ici la mission du cercle Ilé Ẹwà. Modifiable depuis Admin → Pages du site.</p>',
      },
      {
        id: 'section-2',
        title: 'Nos valeurs',
        anchor: 'nos-valeurs',
        image_url: '',
        content_html: '<p>Décrivez ici les valeurs qui animent votre communauté.</p>',
      },
      {
        id: 'section-3',
        title: 'Notre histoire',
        anchor: 'notre-histoire',
        image_url: '',
        content_html: '<p>Racontez ici la genèse et le parcours du cercle.</p>',
      },
    ]);

    await knex('pages').insert({
      title: 'Présentation',
      slug: 'presentation',
      status: 'published',
      content_html: `
        <p>Bienvenue sur la page de présentation d'Ilé Ẹwà. Ce texte d'introduction est un exemple :
        modifiez-le librement depuis le back office (Admin → Pages du site → Présentation).</p>
      `,
      sections: exampleSections,
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
