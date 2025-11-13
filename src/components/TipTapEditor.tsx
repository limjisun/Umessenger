import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Extension } from '@tiptap/core';
import { useEffect } from 'react';
import styles from '../styles/TipTapEditor.module.css';

// FontSize Extension
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize || null,
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setFontSize: (fontSize: string) => ({ chain }: { chain: () => any }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      unsetFontSize: () => ({ chain }: { chain: () => any }) => {
        return chain().setMark('textStyle', { fontSize: null }).updateAttributes('textStyle', { fontSize: null }).run();
      },
    };
  },
});

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TipTapEditor = ({ value, onChange }: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      FontSize,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.editorContainer}>

      
      <div className={styles.toolbar}>

        {/* 글씨 크기 */}
        <div className={styles.toolGroup}>
          <select
            onChange={(e) => {
              const size = e.target.value;
              if (size === 'default') {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (editor.chain().focus() as any).unsetFontSize().run();
              } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (editor.chain().focus() as any).setFontSize(size).run();
              }
            }}
            className={styles.select}
            title="글씨 크기"
          >
            <option value="default">기본</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
            <option value="28px">28px</option>
            <option value="32px">32px</option>
          </select>
        </div>

        {/* 텍스트 스타일 */}
        <div className={styles.toolGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`${styles.toolButton} ${editor.isActive('bold') ? styles.active : ''}`}
            title="굵게 (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`${styles.toolButton} ${editor.isActive('italic') ? styles.active : ''}`}
            title="기울임 (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`${styles.toolButton} ${editor.isActive('underline') ? styles.active : ''}`}
            title="밑줄 (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`${styles.toolButton} ${editor.isActive('strike') ? styles.active : ''}`}
            title="취소선"
          >
            <s>S</s>
          </button>
        </div>
        {/* 정렬 */}
        <div className={styles.toolGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`${styles.toolButton} ${editor.isActive({ textAlign: 'left' }) ? styles.active : ''}`}
            title="왼쪽 정렬"
          >
            ☰
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`${styles.toolButton} ${editor.isActive({ textAlign: 'center' }) ? styles.active : ''}`}
            title="가운데 정렬"
          >
            ≡
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`${styles.toolButton} ${editor.isActive({ textAlign: 'right' }) ? styles.active : ''}`}
            title="오른쪽 정렬"
          >
            ☷
          </button>
        </div>

        

        {/* 색상 */}
        <div className={styles.toolGroup}>
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className={styles.colorPicker}
            title="글자 색"
          />
        </div>

        {/* 표 */}
        <div className={styles.toolGroup}>
          <button
            type="button"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            className={styles.toolButton}
            title="표 삽입 (3x3)"
          >
            ⊞
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            className={styles.toolButton}
            title="왼쪽에 열 추가"
          >
            ⊣
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className={styles.toolButton}
            title="오른쪽에 열 추가"
          >
            ⊢
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className={styles.toolButton}
            title="열 삭제"
          >
            ⊟
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            className={styles.toolButton}
            title="위에 행 추가"
          >
            ⊤
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className={styles.toolButton}
            title="아래에 행 추가"
          >
            ⊥
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className={styles.toolButton}
            title="행 삭제"
          >
            ━
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className={styles.toolButton}
            title="표 삭제"
          >
            ✕
          </button>
        </div>
      </div>
        
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapEditor;
