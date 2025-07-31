// helloWorldSnippets.js

const HELLO_WORLD_SNIPPETS = {
  cpp: `#include <iostream>\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}`,
  css: `body {\n  color: #333;\n  background: #fff;\n}\n/* Hello, World! */`,
  html: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Hello World</title>\n  </head>\n  <body>\n    Hello, World!\n  </body>\n</html>`,
  java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}`,
  javascript: `console.log("Hello, World!");`,
  json: `{
  "message": "Hello, World!"
}`,
  markdown: `# Hello, World!`,
  python: `print("Hello, World!")`,
  sql: `SELECT 'Hello, World!';`,
  yaml: `message: Hello, World!`
};

export default HELLO_WORLD_SNIPPETS; 