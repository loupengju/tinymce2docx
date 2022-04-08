import { useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './tinymce';
import { genDocument } from './utils';

export default function App() {
  const editorRef = useRef<any>(null);

  const log = async () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      genDocument(html);
      // await exportHtmlToDocx(html, dayjs().format('YYYYMMDDHHmmss'));
    }
  };
  return (
    <>
      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue="<p>这是一段文本</p>"
        init={{
          height: 500,
          menubar: false,
          language: 'zh_CN',
          statusbar: false,
          plugins: [
            'advlist anchor autolink lists link image charmap preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'underline strikethrough superscript subscript | link removeformat | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
      <button onClick={log}>下载word文档</button>
    </>
  );
}
