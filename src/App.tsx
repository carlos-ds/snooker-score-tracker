import Home from "@/pages/Home/Home";

import Button from "./components/Button/Button"
import Toggler from "./components/Toggler/Toggler"

function App() {
  return (
    <div>
      <p>Hello world!</p>

      <Toggler onChange={() => document.body.classList.toggle('dark')} />
    
      <Button value="boo" label="Click me" />
      <Button value="foo" label="Press me"/>
      
      <Home />
    </div>
  )
}

export default App;
