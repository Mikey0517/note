import React, { Component, useState, useEffect } from "react";
import { Button } from "antd";

class HookLearn extends Component {
  render () {
    return (
      <div>
        <Counting />
      </div>
    )
  }
}

const Counting = () => {
  const [ count, setCount ] = useState( 0 );

  useEffect( () => {

  } )

  const handleClick = () => {
    setCount( count + 1 );
  }

  return (
    <div>
      <p>你点击了{ count }下</p>
      <Button onClick={ handleClick }>点击</Button>
    </div>
  )
}

export default HookLearn;