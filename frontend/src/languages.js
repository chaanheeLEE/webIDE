// languages.js

export const SUPPORTED_LANGUAGES = {
  cpp: {
    label: "C++",
    loader: () => import('@codemirror/lang-cpp').then(m => m.cpp()),
    fileExtensions: ['.cpp', '.cc', '.cxx'],
    isRunnable: true
  },
  css: {
    label: "CSS",
    loader: () => import('@codemirror/lang-css').then(m => m.css()),
    fileExtensions: ['.css'],
    isRunnable: false
  },
  html: {
    label: "HTML",
    loader: () => import('@codemirror/lang-html').then(m => m.html()),
    fileExtensions: ['.html', '.htm'],
    isRunnable: false
  },
  java: {
    label: "Java",
    loader: () => import('@codemirror/lang-java').then(m => m.java()),
    fileExtensions: ['.java'],
    isRunnable: true
  },
  javascript: {
    label: "JavaScript",
    loader: () => import('@codemirror/lang-javascript').then(m => m.javascript({ jsx: true })),
    fileExtensions: ['.js', '.jsx', '.mjs'],
    isRunnable: true
  },
  json: {
    label: "JSON",
    loader: () => import('@codemirror/lang-json').then(m => m.json()),
    fileExtensions: ['.json'],
    isRunnable: false
  },
  markdown: {
    label: "Markdown",
    loader: () => import('@codemirror/lang-markdown').then(m => m.markdown()),
    fileExtensions: ['.md', '.markdown'],
    isRunnable: false
  },
  python: {
    label: "Python",
    loader: () => import('@codemirror/lang-python').then(m => m.python()),
    fileExtensions: ['.py', '.pyw'],
    isRunnable: true
  },
  sql: {
    label: "SQL",
    loader: () => import('@codemirror/lang-sql').then(m => m.sql()),
    fileExtensions: ['.sql'],
    isRunnable: false
  },
  yaml: {
    label: "YAML",
    loader: () => import('@codemirror/lang-yaml').then(m => m.yaml()),
    fileExtensions: ['.yaml', '.yml'],
    isRunnable: false
  }
};

export const DEFAULT_LANGUAGE = 'javascript';

/**
 * Finds the language configuration for a given file name based on its extension.
 * @param {string} fileName - The name of the file.
 * @returns {object | undefined} The language configuration object or undefined if not found.
 */
export const getLanguageForFile = (fileName) => {
  if (!fileName) return undefined;
  
  // Use `slice` to handle file names that might start with a dot (e.g., .env)
  const extension = "." + fileName.slice(fileName.lastIndexOf('.') + 1);

  // Find the language that has this extension
  const langKey = Object.keys(SUPPORTED_LANGUAGES).find(key => 
    SUPPORTED_LANGUAGES[key].fileExtensions.includes(extension)
  );

  return SUPPORTED_LANGUAGES[langKey];
};