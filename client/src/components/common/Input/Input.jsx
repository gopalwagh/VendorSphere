import './Input.css';

const Input = ({
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) => {
  return (
    <input 
      type={type}
      className='custom-input'
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
    />
  );
};

export default Input;