import React from 'react';
import icon from ".../images/icon.png"

interface TitleProps {
  name : string
}

export default function Title( props: TitleProps ) {
  return (
    <div style={{
      width: '100%', 
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
      marginBottom : 50
    }}>
      <div style={{width: '48px', height: '35px'}}>
        <img src={icon} style={{width: '100%', height: '100%'}} alt='icon'/>
      </div>
      <h4 style={{fontSize: '30px', marginLeft: '10px'}}>{props.name}</h4>
    </div>
  );
}

