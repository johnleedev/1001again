interface DropDownBoxProps {
  widthmain? : string;
  height? : string;
  selectedValue:any, 
  options: { value: string; label: string; }[];
  handleChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  marginHorisontal? : number
}

 
export const DropdownBox: React.FC<DropDownBoxProps> = ({ widthmain, height, selectedValue, handleChange, options, marginHorisontal }) => {

  return (
    <div style={{width:widthmain, height: height, margin: marginHorisontal ? `0 ${marginHorisontal}px` : `0 5px`}}>
      <select 
        value={selectedValue} 
        onChange={handleChange}
        className="dropdownBox"
        style={{
          border: '1px solid #dedede',
          borderRadius: '5px',
          padding: '2px',
          width: '100%',
          height: '100%',
          outline: 'none',
          fontSize: '16px', 
          fontWeight: '300',
        }}
      >
        {options.map((option:any, index:any) => (
          <option key={index} value={option.value} style={{fontSize:'16px', fontWeight:'300'}}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};