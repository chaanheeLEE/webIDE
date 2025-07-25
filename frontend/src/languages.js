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
    fileExtensions: ['.cpp', '.cc', '.cxx'],
    isRunnable: true
  },
  css: { 
    label: "CSS", 
    ext: css,
    fileExtensions: ['.css'],
    isRunnable: false
  },
  html: { 
    label: "HTML", 
    ext: html,
    fileExtensions: ['.html', '.htm'],
    isRunnable: false
  },
  java: { 
    label: "Java", 
    ext: java,
    fileExtensions: ['.java'],
    isRunnable: true
  },
  javascript: { 
    label: "JavaScript", 
    ext: () => javascript({ jsx: true }),
    fileExtensions: ['.js', '.jsx', '.mjs'],
    isRunnable: true
  },
  json: { 
    label: "JSON", 
    ext: json,
    fileExtensions: ['.json'],
    isRunnable: false
  },
  markdown: { 
    label: "Markdown", 
    ext: markdown,
    fileExtensions: ['.md', '.markdown'],
    isRunnable: false
  },
  python: { 
    label: "Python", 
    ext: python,
    fileExtensions: ['.py', '.pyw'],
    isRunnable: true
  },
  sql: { 
    label: "SQL", 
    ext: sql,
    fileExtensions: ['.sql'],
    isRunnable: false
  },
  yaml: { 
    label: "YAML", 
    ext: yaml,
    fileExtensions: ['.yaml', '.yml'],
    isRunnable: false
  }
};

export const DEFAULT_LANGUAGE = 'javascript';
