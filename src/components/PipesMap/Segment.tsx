function getBorderRadius(segment: string) {
  switch (segment) {
    case '╺':
      return "30px 0 0 30px"
    case '╸':
      return "0 30px 30px 0"
    case '╹':
      return "0 0 30px 30px"
    case '╻':
      return "30px 30px 0 0"
    default:
      return "0"
  }
}

const Segment = ({segment, color}: {segment: string, color: string}) => {
  if (segment === '╺' || segment === '╻' || segment === '╹' || segment === '╸') {
    return <div style={{width: '10px', height: '10px', borderRadius: getBorderRadius(segment), background: color}} />
  }
  if (segment === '━') {
    return <div style={{width: '39px', height: '10px', background: color}} />
  }
  if (segment === '┃') {
    return <div style={{width: '10px', height: '39px', background: color}} />
  }
  if (segment === '┏') {
    return <>
      <div style={{width: '10px', height: '23px', borderRadius: "30px 0 0 0", background: color}} />
      <div style={{width: '23px', height: '10px', 
        position: 'absolute', right: 0, top: '50%', transform: "translateY(-50%)",
        borderRadius: "30px 0 0 0", background: color}} />
    </>
  }
  if (segment === '┓') {
    return <>
      <div style={{width: '10px', height: '23px', borderRadius: "0 30px 0 0", background: color}} />
      <div style={{width: '23px', height: '10px', position: 'absolute', left: 0, top: '50%', transform: "translateY(-50%)", borderRadius: "0 30px 0 0", background: color}} />
    </>
  }
  if (segment === '┗') {
    return <>
      <div style={{width: '10px', height: '23px', borderRadius: "0 0 0 30px", background: color}} />
      <div style={{width: '24px', height: '10px', position: 'absolute', right: 0, top: '50%', transform: "translateY(-50%)", borderRadius: "0 0 0 30px", background: color}} />
    </>
  }
  if (segment === '┛') {
    return <>
      <div style={{width: '10px', height: '23px', borderRadius: "0 0 30px 0", background: color}} />
      <div style={{width: '23px', height: '10px', position: 'absolute', left: 0, top: '50%', transform: "translateY(-50%)", borderRadius: "0 0 30px 0", background: color}} />
    </>
  }
  if (segment === '╋') {
    return <>
      <div style={{width: '39px', height: '10px', background: color}} />
      <div style={{width: '10px', height: '39px', position: 'absolute', background: color}} />
    </>
  }
  if (segment === '┫') {
    return <>
      <div style={{width: '10px', height: '39px', background: color}} />
      <div style={{width: '24px', height: '10px', position: 'absolute', left: 0, top: '50%', transform: "translateY(-50%)", background: color}} />
    </>
  }
  if (segment === '┳') {
    return <>
      <div style={{width: '39px', height: '10px', background: color}} />
      <div style={{width: '10px', height: '24px', position: 'absolute', bottom: 0, background: color}} />
    </>
  }
  if (segment === '┻') {
    return <>
      <div style={{width: '39px', height: '10px', background: color}} />
      <div style={{width: '10px', height: '24px', position: 'absolute', top: 0, background: color}} />
    </>
  }
  if (segment === '┣') {
    return <>
      <div style={{width: '10px', height: '39px', background: color}} />
      <div style={{width: '24px', height: '10px', position: 'absolute', right: 0, background: color}} />
    </>
  }
  return <>{segment}</>
}

export default Segment;
