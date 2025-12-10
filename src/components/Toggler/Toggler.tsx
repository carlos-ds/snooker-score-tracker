import './Toggler.css'

type TogglerProps = { 
  onChange?: () => void
}

const Toggler = ({onChange}: TogglerProps) => { 
  
  return (
    <label className='toggler'> 
      <input type="checkbox" className="toggler__checkbox" onChange={onChange} />
      <span className="toggler__circle"></span>
    </label>
  )
}

export default Toggler;