import React, { useState } from "react";
import Editor from "./Editor";

function App() {
  const [value, setValue] = useState("// 코드를 입력해보세요");

  return (
    <div style={{ minHeight: "100vh", background: "#222", padding: "24px" }}>
      <div style={{ color: "#fff" }}>Code Editor</div>
      <Editor value={value} setValue={setValue} />
    </div>
  );
}
export default App;