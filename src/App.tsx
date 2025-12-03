import Button from "./components/Button/Button"
import Toggler from "./components/Toggler/Toggler"

function App() {
  return (
    <div>
      <p>Hello world!</p>

      <Toggler onChange={() => document.body.classList.toggle('dark')} />
    
      <Button value="boo" label="Click me" />
      <Button value="foo" label="Press me"/>
    </div>
  )
}
export default App