import "./App.css";
import TextEditor from "./TextEditor";

const config = {
  bold: (text) => `<strong>${text}</strong>`,
  red: (text) => `<span style="color: red">${text}</span>`,
  green: (text) => `<span style="color: green">${text}</span>`,
};

function App() {
  return (
    <div className="App">
      <TextEditor config={config} />
    </div>
  );
}

export default App;
