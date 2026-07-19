import { Extension } from '@tiptap/core';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import FontFamily from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import './rich-text-editor.css';

const COLORS = ['#f3ede4', '#c9974a', '#6ea26f', '#d16a5a', '#5a8fd1', '#b8ab9a'];

const FONTS = [
  { label: 'Par défaut', value: '' },
  { label: 'Inter (moderne)', value: 'Inter, sans-serif' },
  { label: 'Fraunces (élégant)', value: 'Fraunces, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
];

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'];

// TipTap n'a pas d'extension "taille de police" native : on l'ajoute nous-même
// en étendant la marque textStyle avec un attribut fontSize.
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return { types: ['textStyle'] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize) => ({ chain }) => chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize: () => ({ chain }) => chain().setMark('textStyle', { fontSize: null }).removeEmptyTextStyle().run(),
    };
  },
});

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Adresse du lien :');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const insertTable = () => {
    const rowsInput = window.prompt('Nombre de lignes ?', '3');
    if (!rowsInput) return;
    const colsInput = window.prompt('Nombre de colonnes ?', '3');
    if (!colsInput) return;
    const rows = Math.max(1, parseInt(rowsInput, 10) || 3);
    const cols = Math.max(1, parseInt(colsInput, 10) || 3);
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run();
  };

  const inTable = editor.isActive('table');

  return (
    <div className="rte">
      <div className="rte-toolbar">
        {/* Police */}
        <select
          className="rte-select"
          onChange={(e) => {
            const value = e.target.value;
            if (value) editor.chain().focus().setFontFamily(value).run();
            else editor.chain().focus().unsetFontFamily().run();
          }}
          defaultValue=""
          title="Police"
        >
          {FONTS.map((f) => <option key={f.label} value={f.value}>{f.label}</option>)}
        </select>

        {/* Taille */}
        <select
          className="rte-select"
          onChange={(e) => {
            const value = e.target.value;
            if (value) editor.chain().focus().setFontSize(value).run();
            else editor.chain().focus().unsetFontSize().run();
          }}
          defaultValue=""
          title="Taille du texte"
        >
          <option value="">Taille</option>
          {SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <span className="rte-sep" />

        <button type="button" className={editor.isActive('bold') ? 'active' : ''} onClick={() => editor.chain().focus().toggleBold().run()}><b>G</b></button>
        <button type="button" className={editor.isActive('italic') ? 'active' : ''} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" className={editor.isActive('underline') ? 'active' : ''} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>S</u></button>

        <span className="rte-sep" />

        <button type="button" className={editor.isActive('heading', { level: 2 }) ? 'active' : ''} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Titre</button>
        <button type="button" className={editor.isActive('bulletList') ? 'active' : ''} onClick={() => editor.chain().focus().toggleBulletList().run()}>• Liste</button>
        <button type="button" className={editor.isActive('orderedList') ? 'active' : ''} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. Liste</button>

        <span className="rte-sep" />

        {/* Alignement du paragraphe */}
        <button type="button" title="Aligner à gauche" className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''} onClick={() => editor.chain().focus().setTextAlign('left').run()}>⟸</button>
        <button type="button" title="Centrer" className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''} onClick={() => editor.chain().focus().setTextAlign('center').run()}>≡</button>
        <button type="button" title="Aligner à droite" className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''} onClick={() => editor.chain().focus().setTextAlign('right').run()}>⟹</button>
        <button type="button" title="Justifier" className={editor.isActive({ textAlign: 'justify' }) ? 'active' : ''} onClick={() => editor.chain().focus().setTextAlign('justify').run()}>☰</button>

        <span className="rte-sep" />

        <button type="button" onClick={addLink}>Lien</button>
        <button type="button" onClick={insertTable}>+ Tableau</button>

        {inTable && (
          <>
            <button type="button" title="Ajouter une colonne" onClick={() => editor.chain().focus().addColumnAfter().run()}>+Col</button>
            <button type="button" title="Supprimer la colonne" onClick={() => editor.chain().focus().deleteColumn().run()}>-Col</button>
            <button type="button" title="Ajouter une ligne" onClick={() => editor.chain().focus().addRowAfter().run()}>+Ligne</button>
            <button type="button" title="Supprimer la ligne" onClick={() => editor.chain().focus().deleteRow().run()}>-Ligne</button>
            <button type="button" title="Supprimer le tableau" onClick={() => editor.chain().focus().deleteTable().run()}>✕ Tableau</button>
          </>
        )}

        <span className="rte-sep" />

        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title="Couleur du texte"
            className="rte-color"
            style={{ background: c }}
            onClick={() => editor.chain().focus().setColor(c).run()}
          />
        ))}
        <button type="button" onClick={() => editor.chain().focus().unsetColor().run()}>✕</button>
      </div>
      <EditorContent editor={editor} className="rte-content" placeholder={placeholder} />
    </div>
  );
}
