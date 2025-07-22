// languages.js
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { html } from "@codemirror/lang-html";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { sql } from "@codemirror/lang-sql";
import { yaml } from "@codemirror/lang-yaml";

export const SUPPORTED_LANGUAGES = {
  cpp: { 
    label: "C++", 
    ext: cpp,
    fileExtensions: ['.cpp', '.cc', '.cxx']
  },
  css: { 
    label: "CSS", 
    ext: css,
    fileExtensions: ['.css']
  },
  html: { 
    label: "HTML", 
    ext: html,
    fileExtensions: ['.html', '.htm']
  },
  java: { 
    label: "Java", 
    ext: java,
    fileExtensions: ['.java']
  },
  javascript: { 
    label: "JavaScript", 
    ext: () => javascript({ jsx: true }),
    fileExtensions: ['.js', '.jsx', '.mjs']
  },
  json: { 
    label: "JSON", 
    ext: json,
    fileExtensions: ['.json']
  },
  markdown: { 
    label: "Markdown", 
    ext: markdown,
    fileExtensions: ['.md', '.markdown']
  },
  python: { 
    label: "Python", 
    ext: python,
    fileExtensions: ['.py', '.pyw']
  },
  sql: { 
    label: "SQL", 
    ext: sql,
    fileExtensions: ['.sql']
  },
  yaml: { 
    label: "YAML", 
    ext: yaml,
    fileExtensions: ['.yaml', '.yml']
  }
};

export const DEFAULT_LANGUAGE = 'javascript';
