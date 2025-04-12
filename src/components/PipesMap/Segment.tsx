function getBorderRadius(segment: string) {
  switch (segment) {
    case "╺":
      return "30px 0 0 30px";
    case "╸":
      return "0 30px 30px 0";
    case "╹":
      return "0 0 30px 30px";
    case "╻":
      return "30px 30px 0 0";
    default:
      return "0";
  }
}

const elementLength = "60%";
const elementWidth = "25%";
const isHorizontal = (segment: string) => {
  return segment === "╸" || segment === "╺";
};

type Props = {
  segment: string;
  color: string;
};

const Segment = ({ segment, color }: Props) => {
  if (
    segment === "╺" ||
    segment === "╻" ||
    segment === "╹" ||
    segment === "╸"
  ) {
    return (
      <div
        style={{
          width: isHorizontal(segment) ? elementLength : elementWidth,
          height: isHorizontal(segment) ? elementWidth : elementLength,
          borderRadius: getBorderRadius(segment),
          background: color,
        }}
      />
    );
  }
  if (segment === "━") {
    return (
      <div style={{ width: "100%", height: elementWidth, background: color }} />
    );
  }
  if (segment === "┃") {
    return (
      <div style={{ width: elementWidth, height: "100%", background: color }} />
    );
  }
  if (segment === "┏") {
    return (
      <>
        <div
          style={{
            width: elementWidth,
            height: elementLength,
            borderRadius: "30px 0 0 0",
            background: color,
          }}
        />
        <div
          style={{
            width: elementLength,
            height: elementWidth,
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "30px 0 0 0",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┓") {
    return (
      <>
        <div
          style={{
            width: elementWidth,
            height: elementLength,
            borderRadius: "0 30px 0 0",
            background: color,
          }}
        />
        <div
          style={{
            width: elementLength,
            height: elementWidth,
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "0 30px 0 0",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┗") {
    return (
      <>
        <div
          style={{
            width: elementWidth,
            height: elementLength,
            borderRadius: "0 0 0 30px",
            background: color,
          }}
        />
        <div
          style={{
            width: "62%",
            height: elementWidth,
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "0 0 0 30px",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┛") {
    return (
      <>
        <div
          style={{
            width: elementWidth,
            height: elementLength,
            borderRadius: "0 0 30px 0",
            background: color,
          }}
        />
        <div
          style={{
            width: elementLength,
            height: elementWidth,
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            borderRadius: "0 0 30px 0",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "╋") {
    return (
      <>
        <div
          style={{ width: "100%", height: elementWidth, background: color }}
        />
        <div
          style={{
            width: elementWidth,
            height: "100%",
            position: "absolute",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┫") {
    return (
      <>
        <div
          style={{ width: elementWidth, height: "100%", background: color }}
        />
        <div
          style={{
            width: "62%",
            height: elementWidth,
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┳") {
    return (
      <>
        <div
          style={{ width: "100%", height: elementWidth, background: color }}
        />
        <div
          style={{
            width: elementWidth,
            height: "62%",
            position: "absolute",
            bottom: 0,
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┻") {
    return (
      <>
        <div
          style={{ width: "100%", height: elementWidth, background: color }}
        />
        <div
          style={{
            width: elementWidth,
            height: "62%",
            position: "absolute",
            top: 0,
            background: color,
          }}
        />
      </>
    );
  }
  if (segment === "┣") {
    return (
      <>
        <div
          style={{ width: elementWidth, height: "100%", background: color }}
        />
        <div
          style={{
            width: "62%",
            height: elementWidth,
            position: "absolute",
            right: 0,
            background: color,
          }}
        />
      </>
    );
  }
  return <>{segment}</>;
};

export default Segment;
