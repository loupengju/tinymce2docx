import { useEffect, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import './tinymce';
import { genDocument } from './utils';

export default function App() {
  const editorRef = useRef<any>(null);
  const urlRef = useRef<Record<string, ArrayBuffer>>({});

  const urlToBuffer = (url: string) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('readystatechange', function (event) {
      if (xhr.status === 200 && xhr.readyState === 4) {
        // 构造blob对象,具体看头部提供的链接地址
        urlRef.current[url] = xhr.response;
        console.log(urlRef.current);
      }
    });
    xhr.send();
  };

  const log = async () => {
    if (editorRef.current) {
      const html = editorRef.current.getContent();
      genDocument(html, urlRef.current);
      // await exportHtmlToDocx(html, dayjs().format('YYYYMMDDHHmmss'));
    }
  };

  return (
    <>
      <Editor
        onInit={(evt, editor) => (editorRef.current = editor)}
        initialValue=""
        init={{
          skin: false,
          content_css: false,
          height: 500,
          menubar: false,
          language: 'zh_CN',
          statusbar: false,
          convert_urls: false,
          urlconverter_callback: (url, node, on_save, name) => {
            urlToBuffer(url);
            return url;
          },
          plugins: [
            'advlist anchor autolink lists link image charmap preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table code help wordcount',
          ],
          toolbar:
            'undo redo | formatselect | ' +
            'bold italic forecolor backcolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'underline strikethrough superscript subscript | link image removeformat | help',
          content_style:
            'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
        }}
      />
      <button onClick={log}>下载word文档</button>
    </>
  );
}
